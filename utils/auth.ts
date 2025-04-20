import crypto from "crypto"

// Generate a salt
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString("hex")
}

// Hash a password with PBKDF2
export async function hash(password: string): Promise<string> {
  const salt = generateSalt()
  const iterations = 10000
  const keylen = 64
  const digest = "sha512"

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) reject(err)
      // Format: iterations:salt:hash
      resolve(`${iterations}:${salt}:${derivedKey.toString("hex")}`)
    })
  })
}

// Verify a password against a hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [iterations, salt, hash] = storedHash.split(":")
    const keylen = 64
    const digest = "sha512"

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, Number.parseInt(iterations), keylen, digest, (err, derivedKey) => {
        if (err) reject(err)
        resolve(derivedKey.toString("hex") === hash)
      })
    })
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}
