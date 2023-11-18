import { ValidateSession } from "$lib/server/sessionHandler";
import TwitchBot from "$lib/server/twitchBot";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, cookies }) => {
	ValidateSession(cookies, locals.user, 'session_id');
    if (locals.user) TwitchBot.JoinChannel(locals.user?.name)

    return new Response(null, { status: 204 })
}