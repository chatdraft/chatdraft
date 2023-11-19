import { setSession, updateSession } from '$lib/server/sessionHandler';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";
import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import { PUBLIC_TWITCH_OAUTH_CLIENT_ID, PUBLIC_TWITCH_REDIRECT_URI } from '$env/static/public';
import TwitchBot from '$lib/server/twitchBot';
import { saveToken } from '$lib/server/tokenHandler';

const authProvider = new RefreshingAuthProvider(
	{
		clientId: PUBLIC_TWITCH_OAUTH_CLIENT_ID,
		clientSecret: env.TWITCH_CLIENT_SECRET
	}
);

export const GET: RequestHandler = async ( { cookies, url } ) => {
    const code = url.searchParams.get('code');
    if (!code) throw error(400, 'No code provided.');

    try {
        // Get the authentication object using the user's code
        const tokenData = await exchangeCode(PUBLIC_TWITCH_OAUTH_CLIENT_ID, env.TWITCH_CLIENT_SECRET, code, PUBLIC_TWITCH_REDIRECT_URI);

        const user_id = await authProvider.addUserForToken(tokenData);

        if(tokenData.scope.includes('chat:read') && tokenData.scope.includes('chat:edit')) {
            await saveToken(user_id, JSON.stringify(tokenData));
            authProvider.addUser(env.TWITCH_USER_ID, tokenData, ['chat:read','chat:edit']);
            TwitchBot.getInstance(authProvider);
        }
        else {
            const session_id = setSession(tokenData, user_id);
            authProvider.onRefresh(async (userId, newTokenData) => {
                updateSession(session_id, newTokenData)
                if (userId == env.TWITCH_USER_ID) {
                    await saveToken(user_id, JSON.stringify(tokenData));
                }
            });

            cookies.set('session_id', session_id, {path: '/', httpOnly: true, maxAge: tokenData.expiresIn! })
        }

        // Create new session for the user
        const session_id = setSession(tokenData, user_id);
        authProvider.onRefresh(async (_userId, newTokenData) => {
            updateSession(session_id, newTokenData)
        });

        // Optionally, you can upsert the user in the DB here

        // set the session cookie
        cookies.set('session_id', session_id, {path: '/', httpOnly: true, maxAge: tokenData.expiresIn! })

    } catch (error) {
        console.log(error);
    };

    throw redirect(302, '/')
}