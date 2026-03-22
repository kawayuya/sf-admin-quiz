import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  passwordHash: text("passwordHash"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const quizResults = pgTable("quizResults", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  mode: text("mode").default("normal").notNull(),
  selectedCategories: text("selectedCategories"),
  totalQuestions: integer("totalQuestions").notNull(),
  correctAnswers: integer("correctAnswers").notNull(),
  score: integer("score").notNull(),
  categoryResults: text("categoryResults"),
  wrongQuestionIds: text("wrongQuestionIds"),
  timeSpent: integer("timeSpent"),
  completedAt: timestamp("completedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
