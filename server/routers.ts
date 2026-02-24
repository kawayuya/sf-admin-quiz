import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quiz: router({
    saveResult: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["normal", "weakPoints"]),
          selectedCategories: z.array(z.string()).optional(),
          totalQuestions: z.number(),
          correctAnswers: z.number(),
          score: z.number(),
          categoryResults: z.record(z.string(), z.object({ correct: z.number(), total: z.number() })),
          wrongQuestionIds: z.array(z.number()),
          timeSpent: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createQuizResult({
          userId: ctx.user.id,
          mode: input.mode,
          selectedCategories: input.selectedCategories ? JSON.stringify(input.selectedCategories) : null,
          totalQuestions: input.totalQuestions,
          correctAnswers: input.correctAnswers,
          score: input.score,
          categoryResults: JSON.stringify(input.categoryResults),
          wrongQuestionIds: JSON.stringify(input.wrongQuestionIds),
          timeSpent: input.timeSpent,
          completedAt: new Date(),
        });
      }),

    getResults: protectedProcedure.query(({ ctx }) => {
      return db.getUserQuizResults(ctx.user.id);
    }),

    getResult: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => {
        return db.getQuizResultById(input.id, ctx.user.id);
      }),

    getWrongQuestionIds: protectedProcedure.query(({ ctx }) => {
      return db.getWrongQuestionIds(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
