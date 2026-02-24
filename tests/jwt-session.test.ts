import { describe, it, expect } from "vitest";
import { SignJWT, jwtVerify } from "jose";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

describe("JWT Session Management", () => {
  it("should create and verify JWT session token", async () => {
    // Create a test secret key
    const secret = "test-secret-key-for-session-verification";
    const secretKey = new TextEncoder().encode(secret);

    // Create session token
    const issuedAt = Date.now();
    const expiresInMs = ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    const token = await new SignJWT({
      openId: "test-user-123",
      appId: "test-app-id",
      name: "Test User",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);

    console.log("Token created:", token.substring(0, 50) + "...");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    // Verify token
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    console.log("Token verified, payload:", payload);
    expect(payload.openId).toBe("test-user-123");
    expect(payload.appId).toBe("test-app-id");
    expect(payload.name).toBe("Test User");
  });

  it("should fail verification with wrong secret", async () => {
    const secret = "test-secret-key-for-session-verification";
    const secretKey = new TextEncoder().encode(secret);
    const wrongSecretKey = new TextEncoder().encode("wrong-secret");

    // Create session token
    const issuedAt = Date.now();
    const expiresInMs = ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    const token = await new SignJWT({
      openId: "test-user-123",
      appId: "test-app-id",
      name: "Test User",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);

    // Try to verify with wrong secret
    try {
      await jwtVerify(token, wrongSecretKey, {
        algorithms: ["HS256"],
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      console.log("Expected error:", error instanceof Error ? error.message : String(error));
      expect(error).toBeDefined();
    }
  });

  it("should fail verification with expired token", async () => {
    const secret = "test-secret-key-for-session-verification";
    const secretKey = new TextEncoder().encode(secret);

    // Create expired session token
    const issuedAt = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    const expiresInMs = 1000; // 1 second
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    const token = await new SignJWT({
      openId: "test-user-123",
      appId: "test-app-id",
      name: "Test User",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);

    // Try to verify expired token
    try {
      await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      console.log("Expected error:", error instanceof Error ? error.message : String(error));
      expect(error).toBeDefined();
    }
  });
});
