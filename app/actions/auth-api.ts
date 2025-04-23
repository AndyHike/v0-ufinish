"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import remonline from "@/lib/api/remonline"
import { generateVerificationCode, storeVerificationCode, verifyCode } from "@/lib/auth/verification-code"
import { sendVerificationCode } from "@/lib/email/send-email"

// Initialize Remonline API with token
const initRemonline = () => {
  const apiToken = process.env.REMONLINE_API_TOKEN
  if (!apiToken) {
    throw new Error("REMONLINE_API_TOKEN is not defined")
  }
  return remonline.auth(apiToken)
}

// Check if user exists in Remonline
export async function checkUserExists(identifier: string, isEmail = true) {
  try {
    const api = initRemonline()

    let client = null
    if (isEmail) {
      client = await api.getClientByEmail(identifier)
    } else {
      client = await api.getClientByPhone(identifier)
    }

    return {
      exists: !!client,
      userData: client,
    }
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return { exists: false, error: "Failed to check user existence" }
  }
}

// Start login process
export async function initiateLogin(identifier: string, isEmail = true) {
  try {
    const { exists, userData, error } = await checkUserExists(identifier, isEmail)

    if (error) {
      return { success: false, message: error }
    }

    if (!exists || !userData) {
      return { success: false, message: "userNotFound" }
    }

    // Generate and store verification code
    const code = generateVerificationCode()
    const email = userData.email

    if (!email) {
      return { success: false, message: "emailNotFound" }
    }

    // Store the code in the database
    const stored = await storeVerificationCode(
      null, // We don't have a user ID in our system yet
      email,
      code,
      "login",
    )

    if (!stored) {
      return { success: false, message: "failedToStoreCode" }
    }

    // Send verification code email
    await sendVerificationCode(email, code, "en", true)

    // Store the email in a temporary cookie for the verification step
    cookies().set("temp_login_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    })

    // Store the Remonline user data in a temporary cookie
    cookies().set("temp_remonline_data", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    })

    return {
      success: true,
      message: "verificationCodeSent",
      email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Mask email for privacy
    }
  } catch (error) {
    console.error("Error initiating login:", error)
    return { success: false, message: "unexpectedError" }
  }
}

// Verify login code
export async function verifyLoginCode(code: string) {
  try {
    // Get the email from the temporary cookie
    const email = cookies().get("temp_login_email")?.value

    if (!email) {
      return { success: false, message: "sessionExpired" }
    }

    // Verify the code
    const verification = await verifyCode(email, code)

    if (!verification.valid) {
      return { success: false, message: verification.error || "invalidCode" }
    }

    // Get the Remonline user data from the temporary cookie
    const remonlineDataStr = cookies().get("temp_remonline_data")?.value

    if (!remonlineDataStr) {
      return { success: false, message: "sessionExpired" }
    }

    const remonlineData = JSON.parse(remonlineDataStr)

    // Check if user exists in our database
    const supabase = createServerSupabaseClient()
    const { data: existingUser } = await supabase.from("users").select("id, role").eq("email", email).single()

    let userId

    if (existingUser) {
      // User exists, update their data
      userId = existingUser.id

      // Update user data if needed
      await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("id", userId)

      // Update profile data
      await supabase
        .from("profiles")
        .update({
          name: remonlineData.name || `${remonlineData.first_name} ${remonlineData.last_name}`.trim(),
          phone: remonlineData.phone?.[0] || null,
        })
        .eq("id", userId)
    } else {
      // User doesn't exist, create a new one
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          email: email,
          role: "user",
          email_verified: true, // Already verified through code
        })
        .select("id")
        .single()

      if (userError || !newUser) {
        console.error("Error creating user:", userError)
        return { success: false, message: "failedToCreateUser" }
      }

      userId = newUser.id

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        name: remonlineData.name || `${remonlineData.first_name} ${remonlineData.last_name}`.trim(),
        phone: remonlineData.phone?.[0] || null,
        avatar_url: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(remonlineData.name || "User")}`,
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // Clean up the user if profile creation fails
        await supabase.from("users").delete().eq("id", userId)
        return { success: false, message: "failedToCreateProfile" }
      }
    }

    // Create a session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: userId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      ])
      .select("id")
      .single()

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, message: "failedToCreateSession" }
    }

    // Set session cookie
    cookies().set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Clear temporary cookies
    cookies().delete("temp_login_email")
    cookies().delete("temp_remonline_data")

    return {
      success: true,
      role: existingUser?.role || "user",
    }
  } catch (error) {
    console.error("Error verifying login code:", error)
    return { success: false, message: "unexpectedError" }
  }
}

// Start registration process
export async function initiateRegistration(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = (formData.get("address") as string) || ""

    if (!firstName || !lastName || !email || !phone) {
      return { success: false, message: "missingRequiredFields" }
    }

    // Check if user already exists in Remonline
    const { exists } = await checkUserExists(email, true)

    if (exists) {
      return { success: false, message: "userAlreadyExists" }
    }

    // Generate and store verification code
    const code = generateVerificationCode()

    // Store the code in the database
    const stored = await storeVerificationCode(null, email, code, "registration")

    if (!stored) {
      return { success: false, message: "failedToStoreCode" }
    }

    // Send verification code email
    await sendVerificationCode(email, code, "en", false)

    // Store the registration data in a temporary cookie
    const registrationData = {
      firstName,
      lastName,
      email,
      phone,
      address,
    }

    cookies().set("temp_registration_data", JSON.stringify(registrationData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15   {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    })

    return {
      success: true,
      message: "verificationCodeSent",
      email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Mask email for privacy
    }
  } catch (error) {
    console.error("Error initiating registration:", error)
    return { success: false, message: "unexpectedError" }
  }
}

// Verify registration code and create user
export async function verifyRegistrationCode(code: string) {
  try {
    // Get the registration data from the temporary cookie
    const registrationDataStr = cookies().get("temp_registration_data")?.value

    if (!registrationDataStr) {
      return { success: false, message: "sessionExpired" }
    }

    const registrationData = JSON.parse(registrationDataStr)
    const { firstName, lastName, email, phone, address } = registrationData

    // Verify the code
    const verification = await verifyCode(email, code)

    if (!verification.valid) {
      return { success: false, message: verification.error || "invalidCode" }
    }

    // Create user in Remonline
    const api = initRemonline()

    try {
      const remonlineResponse = await api.createClient({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        address: address,
      })

      if (!remonlineResponse.success) {
        return { success: false, message: "failedToCreateRemonlineUser" }
      }

      // Create user in our database
      const supabase = createServerSupabaseClient()

      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          email: email,
          role: "user",
          email_verified: true, // Already verified through code
        })
        .select("id")
        .single()

      if (userError || !newUser) {
        console.error("Error creating user:", userError)
        return { success: false, message: "failedToCreateUser" }
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: newUser.id,
        name: `${firstName} ${lastName}`.trim(),
        phone: phone,
        avatar_url: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${firstName} ${lastName}`)}`,
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // Clean up the user if profile creation fails
        await supabase.from("users").delete().eq("id", newUser.id)
        return { success: false, message: "failedToCreateProfile" }
      }

      // Create a session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert([
          {
            user_id: newUser.id,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          },
        ])
        .select("id")
        .single()

      if (sessionError) {
        console.error("Error creating session:", sessionError)
        return { success: false, message: "failedToCreateSession" }
      }

      // Set session cookie
      cookies().set("session_id", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })

      // Clear temporary cookie
      cookies().delete("temp_registration_data")

      return { success: true }
    } catch (error) {
      console.error("Error creating Remonline user:", error)
      return { success: false, message: "failedToCreateRemonlineUser" }
    }
  } catch (error) {
    console.error("Error verifying registration code:", error)
    return { success: false, message: "unexpectedError" }
  }
}

// Logout user
export async function logout() {
  cookies().delete("session_id")
  return { success: true }
}
