import { pgTable, pgEnum, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Create a match_status enum with values 'scheduled', 'live', and 'finished'
export const matchStatus = pgEnum('match_status', ['scheduled', 'live', 'finished']);

// Matches table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatus('status').default('scheduled').notNull(),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Commentary table
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .references(() => matches.id, { onDelete: 'cascade' })
    .notNull(),
  minute: integer('minute'),
  sequence: integer('sequence'),
  period: text('period'),
  eventType: text('event_type'),
  actor: text('actor'),
  team: text('team'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
