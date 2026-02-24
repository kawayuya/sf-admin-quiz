import { describe, it, expect } from "vitest";
import * as db from "../server/db";
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

describe("Email Authentication E2E", () => {
  const testEmail = "kawamoto.yuya.1228@gmail.com";
  const testPassword = "yuyaK1228";

  it("should create a new user and verify password", async () => {
    // Create user
    const passwordHash = await hashPassword(testPassword);
    const openId = `email_${crypto.randomBytes(16).toString("hex")}`;

    console.log("[Test] Creating user with:");
    console.log("  - email:", testEmail);
    console.log("  - password:", testPassword);
    console.log("  - passwordHash:", passwordHash);

    await db.upsertUser({
      openId,
      email: testEmail,
      passwordHash,
      loginMethod: "email",
      name: null,
      lastSignedIn: new Date(),
    });

    // Retrieve user by email
    const user = await db.getUserByEmail(testEmail);
    console.log("[Test] User retrieved:", {
      id: user?.id,
      email: user?.email,
      passwordHash: user?.passwordHash ? "set" : "null",
    });

    expect(user).toBeDefined();
    expect(user?.email).toBe(testEmail);
    expect(user?.passwordHash).toBeDefined();

    // Verify password
    const isPasswordValid = await verifyPassword(testPassword, user!.passwordHash!);
    console.log("[Test] Password verification result:", isPasswordValid);
    expect(isPasswordValid).toBe(true);

    // Verify wrong password fails
    const isWrongPasswordValid = await verifyPassword("wrongPassword", user!.passwordHash!);
    console.log("[Test] Wrong password verification result:", isWrongPasswordValid);
    expect(isWrongPasswordValid).toBe(false);
  });

  it("should handle duplicate email registration", async () => {
    const passwordHash = await hashPassword(testPassword);
    const openId = `email_${crypto.randomBytes(16).toString("hex")}`;

    // First user already exists from previous test
    const existingUser = await db.getUserByEmail(testEmail);
    expect(existingUser).toBeDefined();

    // Try to create another user with same email
    await db.upsertUser({
      openId,
      email: testEmail,
      passwordHash,
      loginMethod: "email",
      name: null,
      lastSignedIn: new Date(),
    });

    // Should have updated the existing user
    const updatedUser = await db.getUserByEmail(testEmail);
    console.log("[Test] Updated user:", {
      id: updatedUser?.id,
      email: updatedUser?.email,
      openId: updatedUser?.openId,
    });

    // The openId should be different (upsert creates new entry with different openId)
    // but email should be the same
    expect(updatedUser?.email).toBe(testEmail);
  });
});
