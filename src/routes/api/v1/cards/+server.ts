import { GetAllCards } from "$lib/server/cardsHandler";
import { ValidateSession } from "$lib/server/sessionHandler";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, cookies }) => {
    ValidateSession(cookies, locals.user, 'session_id');

    const cards = await GetAllCards();

    return json(cards);
}