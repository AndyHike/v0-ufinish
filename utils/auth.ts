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
