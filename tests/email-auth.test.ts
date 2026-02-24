import { describe, it, expect, beforeAll } from "vitest";
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

describe("Email Authentication", () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "TestPassword123";
  let testUserId: number | undefined;

  beforeAll(async () => {
    // Clean up any existing test user
    try {
      const existingUser = await db.getUserByEmail(testEmail);
      console.log("[Test] Existing user check:", existingUser);
    } catch (error) {
      console.log("[Test] Error checking existing user:", error);
    }
  });

  it("should create a new user with email and password", async () => {
    const passwordHash = await hashPassword(testPassword);
    const openId = `email_${crypto.randomBytes(16).toString("hex")}`;

    console.log("[Test] Creating user with:");
    console.log("  - openId:", openId);
    console.log("  - email:", testEmail);
    console.log("  - passwordHash:", passwordHash ? "set" : "not set");

    try {
      await db.upsertUser({
        openId,
        email: testEmail,
        passwordHash,
        loginMethod: "email",
        name: null,
        lastSignedIn: new Date(),
      });
      console.log("[Test] User created successfully");

      // Verify user was created
      const user = await db.getUserByOpenId(openId);
      console.log("[Test] User retrieved by openId:", user);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.passwordHash).toBe(passwordHash);
      testUserId = user?.id;
    } catch (error) {
      console.error("[Test] Error creating user:", error);
      throw error;
    }
  });

  it("should retrieve user by email", async () => {
    try {
      const user = await db.getUserByEmail(testEmail);
      console.log("[Test] User retrieved by email:", user);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    } catch (error) {
      console.error("[Test] Error retrieving user by email:", error);
      throw error;
    }
  });

  it("should update user password", async () => {
    if (!testUserId) {
      throw new Error("testUserId is not set");
    }

    const newPassword = "NewPassword456";
    const newPasswordHash = await hashPassword(newPassword);

    try {
      await db.updateUserPassword(testUserId, newPasswordHash);
      console.log("[Test] Password updated successfully");

      // Verify password was updated
      const user = await db.getUserByEmail(testEmail);
      console.log("[Test] User retrieved after password update:", user);
      expect(user?.passwordHash).toBe(newPasswordHash);
    } catch (error) {
      console.error("[Test] Error updating password:", error);
      throw error;
    }
  });

  it("should create password reset token", async () => {
    if (!testUserId) {
      throw new Error("testUserId is not set");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
      await db.createPasswordResetToken(testUserId, resetToken, expiresAt);
      console.log("[Test] Password reset token created successfully");

      // Verify token was created
      const token = await db.getPasswordResetToken(resetToken);
      console.log("[Test] Token retrieved:", token);
      expect(token).toBeDefined();
      expect(token?.token).toBe(resetToken);
    } catch (error) {
      console.error("[Test] Error creating password reset token:", error);
      throw error;
    }
  });
});
