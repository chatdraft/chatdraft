import { ValidateSession } from "$lib/server/sessionHandler";
import TwitchBot from "$lib/server/twitchBot";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, cookies }) => {
	ValidateSession(cookies, locals.user, 'session_id');
    let response = false;
    if (locals.user) response = await TwitchBot.IsBotInChannel(locals.user?.name)

    return json(response);
}