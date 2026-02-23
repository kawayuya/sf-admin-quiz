import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

// Copy of the hash functions from oauth.ts
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, async (err, salt) => {
      if (err) reject(err);
      try {
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        const hashedPassword = salt.toString("hex") + ":" + derivedKey.toString("hex");
        resolve(hashedPassword);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [salt, key] = hashedPassword.split(":");
    const derivedKey = (await scryptAsync(password, Buffer.from(salt, "hex"), 64)) as Buffer;
    return key === derivedKey.toString("hex");
  } catch (error) {
    console.error("[Auth] Password verification failed:", error);
    return false;
  }
}

describe("Password Hashing", () => {
  it("should hash a password", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).toContain(":");
    const [salt, key] = hash.split(":");
    expect(salt).toHaveLength(32); // 16 bytes * 2 hex chars
    expect(key).toHaveLength(128); // 64 bytes * 2 hex chars
  });

  it("should verify a correct password", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const password = "testPassword123";
    const wrongPassword = "wrongPassword456";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it("should generate different hashes for the same password", async () => {
    const password = "testPassword123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2); // Different salts
  });
});
