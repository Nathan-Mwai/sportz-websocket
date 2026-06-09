import { z } from 'zod';

// Constant for match status
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Helper function to check if a string is a valid ISO date string
const isValidISODate = (val) => {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
  return isoRegex.test(val) && !isNaN(Date.parse(val));
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
  startTime: z.string().refine(isValidISODate, {
    message: 'startTime must be a valid ISO date string',
  }),
  endTime: z.string().refine(isValidISODate, {
    message: 'endTime must be a valid ISO date string',
  }),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
}).superRefine((data, ctx) => {
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
