import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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

// TODO: add feature queries here as your schema grows.


// Quiz result queries
import { InsertQuizResult, quizResults } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export async function createQuizResult(data: InsertQuizResult) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(quizResults).values(data);
    const result = await db
      .select()
      .from(quizResults)
      .orderBy(desc(quizResults.createdAt))
      .limit(1);
    return result[0]?.id || 0;
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
