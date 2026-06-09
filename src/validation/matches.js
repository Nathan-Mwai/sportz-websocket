import { z } from 'zod';

// Constant for match status
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Validates an optional limit as a coerced positive integer with a maximum of 100
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Validates a required id as a coerced positive integer
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Validates match creation inputs
export const createMatchSchema = z.object({
  sport: z.string().min(1, 'Sport cannot be empty'),
  homeTeam: z.string().min(1, 'Home team cannot be empty'),
  awayTeam: z.string().min(1, 'Away team cannot be empty'),
  startTime: z.iso.datetime({
    offset: true,
    message: 'startTime must be a valid ISO date string',
  }),
  endTime: z.iso.datetime({
    offset: true,
    message: 'endTime must be a valid ISO date string',
  }).nullable().optional(),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
}).superRefine((data, ctx) => {
  if (!data.endTime) return;
  const start = Date.parse(data.startTime);
  const end = Date.parse(data.endTime);
  if (!isNaN(start) && !isNaN(end) && end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endTime must be chronologically after startTime',
      path: ['endTime'],
    });
  }
});

// Validates match score updates
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
