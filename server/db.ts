import { eq, desc, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { InsertUser, users, InsertQuizResult, quizResults, passwordResetTokens } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: any = null;
let _sqlite: any = null;

export async function getDb() {
  if (!_db) {
    try {
      _sqlite = new Database("sqlite.db");
      _db = drizzle(_sqlite, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createQuizResult(data: InsertQuizResult) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const res = await db.insert(quizResults).values(data);
    const lastId = _sqlite.prepare("SELECT last_insert_rowid() as id").get().id;
    return lastId || 0;
  } catch (error) {
    console.error("[Database] Failed to create quiz result:", error);
    throw error;
  }
}

export async function getUserQuizResults(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quiz results: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get quiz results:", error);
    return [];
  }
}

export async function getQuizResultById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quiz result: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, id))
      .limit(1);

    if (result.length === 0) return undefined;
    if (result[0].userId !== userId) return undefined;

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get quiz result:", error);
    return undefined;
  }
}

export async function getWrongQuestionIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get wrong questions: database not available");
    return [];
  }

  try {
    const results = await db
      .select({ wrongQuestionIds: quizResults.wrongQuestionIds })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    const allWrongIds = new Set<number>();
    results.forEach((r) => {
      if (r.wrongQuestionIds) {
        try {
          const ids = JSON.parse(r.wrongQuestionIds) as number[];
          ids.forEach((id) => allWrongIds.add(id));
        } catch (e) {
          console.warn("[Database] Failed to parse wrong question IDs", e);
        }
      }
    });

    return Array.from(allWrongIds);
  } catch (error) {
    console.error("[Database] Failed to get wrong question IDs:", error);
    return [];
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return undefined;
  }
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user password:", error);
    throw error;
  }
}

export async function createPasswordResetToken(
  userId: number,
  token: string,
  expiresAt: Date,
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("[Database] Failed to create password reset token:", error);
    throw error;
  }
}

export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get password reset token: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get password reset token:", error);
    return undefined;
  }
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
  } catch (error) {
    console.error("[Database] Failed to delete password reset token:", error);
    throw error;
  }
}

export async function deleteExpiredPasswordResetTokens(): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .delete(passwordResetTokens)
      .where(ne(passwordResetTokens.expiresAt, new Date()));
  } catch (error) {
    console.error("[Database] Failed to delete expired password reset tokens:", error);
  }
}
