import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { desc, eq } from 'drizzle-orm';

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        return res.status(400).json({ error: 'Invalid Match ID', details: JSON.stringify(paramsParsed.error) });
    }

    const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
        return res.status(400).json({ error: 'Invalid Request Query', details: JSON.stringify(queryParsed.error) });
    }

    const matchId = paramsParsed.data.id;
    const limit = Math.min(queryParsed.data.limit ?? 100, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        res.json({ data });
    } catch (error) {
        console.error("Failed to list commentary:", error);
        res.status(500).json({ error: 'Failed to list commentary', details: JSON.stringify(error) });
    }
});

commentaryRouter.post('/', async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        return res.status(400).json({ error: 'Invalid Match ID', details: JSON.stringify(paramsParsed.error) });
    }

    const bodyParsed = createCommentarySchema.safeParse(req.body);
    if (!bodyParsed.success) {
        return res.status(400).json({ error: 'Invalid Request Body', details: JSON.stringify(bodyParsed.error) });
    }

    const matchId = paramsParsed.data.id;
    try {
        const [event] = await db.insert(commentary).values({
            matchId,
            ...bodyParsed.data
        }).returning();

        if(res.app.locals.broadcastCommentary){
            res.app.locals.broadcastCommentary(event.matchId,event);
        }

        res.status(201).json({ data: event });
    } catch (error) {
        console.error("Failed to create commentary:", error);
        res.status(500).json({ error: 'Failed to create commentary', details: JSON.stringify(error) });
    }
});
