import crypto from "crypto";

/**
 * Hashes a plaintext password using PBKDF2 with a unique random salt.
 * Safe for storing in localStorage databases.
 */
export function hashPassword(password: string): string {
  if (!password) return "";
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a previously generated PBKDF2 salt-hash string.
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash || !hash.includes(":")) return false;
  try {
    const [salt, originalHash] = hash.split(":");
    const testHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return testHash === originalHash;
  } catch (error) {
    console.error("Failed to verify password hash:", error);
    return false;
  }
}
