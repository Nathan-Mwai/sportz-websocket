import { MATCH_STATUS } from '../validation/matches.js';

export function getMatchStatus(startTime, endTime, now = new Date()) {
    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
        return null;
    }

    if (endTime === null || endTime === undefined) {
        if (now < start) {
            return MATCH_STATUS.SCHEDULED;
        }
        return MATCH_STATUS.LIVE;
    }

    const end = new Date(endTime);
    if (Number.isNaN(end.getTime())) {
        return null;
    }

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match, updateStatus) {
    const nextStatus = getMatchStatus(match.startTime, match.endTime);
    if (!nextStatus) {
        return match;
    }
    if (match.status !== nextStatus) {
        await updateStatus(nextStatus);
        return { ...match, status: nextStatus };
    }
    return match;
}