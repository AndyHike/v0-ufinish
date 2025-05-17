import crypto from "crypto"

// Hash a password using PBKDF2
export async function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString("hex")

    // Use PBKDF2 to hash the password
    crypto.pbkdf2(password, salt, 10000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err)
      // Format: iterations:salt:hash
      resolve(`10000:${salt}:${derivedKey.toString("hex")}`)
    })
  })
}

// Verify a password against a stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // Extract the salt and iteration count from the stored hash
      const [iterations, salt, hash] = storedHash.split(":")
      const iterCount = Number.parseInt(iterations)

      // Hash the provided password with the same salt and iterations
      crypto.pbkdf2(password, salt, iterCount, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err)
        // Compare the hashes
        resolve(derivedKey.toString("hex") === hash)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Check if user has admin role
export function checkAdminRole(user: any): boolean {
  // Check if user exists
  if (!user) return false

  // Check if user has role property and it's 'admin'
  if (user.role === "admin") return true

  // Check if user has roles array and it includes 'admin'
  if (Array.isArray(user.roles) && user.roles.includes("admin")) return true

  // Check if user has metadata with role or roles
  if (user.metadata) {
    if (user.metadata.role === "admin") return true
    if (Array.isArray(user.metadata.roles) && user.metadata.roles.includes("admin")) return true
  }

  // Check if user has user_metadata with role or roles (Supabase format)
  if (user.user_metadata) {
    if (user.user_metadata.role === "admin") return true
    if (Array.isArray(user.user_metadata.roles) && user.user_metadata.roles.includes("admin")) return true
  }

  return false
}
