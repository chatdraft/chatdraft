import { setSession, updateSession } from '$lib/server/sessionHandler';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env as privateenv } from "$env/dynamic/private";
import { env } from "$env/dynamic/public";
import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import TwitchBot from '$lib/server/twitchBot';
import { ApiClient } from '@twurple/api';
import { DbSaveToken } from '$lib/server/db'

const authProvider = new RefreshingAuthProvider(
	{
		clientId: env.PUBLIC_TWITCH_OAUTH_CLIENT_ID,
		clientSecret: privateenv.TWITCH_CLIENT_SECRET
	}
);

export const GET: RequestHandler = async ( { cookies, url } ) => {
    const code = url.searchParams.get('code');
    if (!code) throw error(400, 'No code provided.');

    let redirect_uri = '/';

    try {
        // Get the authentication object using the user's code
        const tokenData = await exchangeCode(env.PUBLIC_TWITCH_OAUTH_CLIENT_ID, privateenv.TWITCH_CLIENT_SECRET, code, env.PUBLIC_TWITCH_REDIRECT_URI);

        const user_id = await authProvider.addUserForToken(tokenData);

        if(tokenData.scope.includes('chat:read') && tokenData.scope.includes('chat:edit')) {
            await DbSaveToken(user_id, tokenData);
            authProvider.addUser(env.PUBLIC_TWITCH_USER_ID, tokenData, ['chat:read','chat:edit']);
            TwitchBot.getInstance(authProvider);
        }
        else {
            const session_id = setSession(tokenData, user_id);
            authProvider.onRefresh(async (userId, newTokenData) => {
                updateSession(session_id, newTokenData)
                if (userId == env.PUBLIC_TWITCH_USER_ID) {
                    await DbSaveToken(user_id, tokenData);
                }
            });

            cookies.set('session_id', session_id, {path: '/', httpOnly: true, maxAge: tokenData.expiresIn!, sameSite: true })
        }

        // Create new session for the user
        const session_id = setSession(tokenData, user_id);
        authProvider.onRefresh(async (_userId, newTokenData) => {
            updateSession(session_id, newTokenData)
        });

        // Optionally, you can upsert the user in the DB here

        // set the session cookie
        cookies.set('session_id', session_id, {path: '/', httpOnly: true, maxAge: tokenData.expiresIn! })

        const api = new ApiClient({authProvider});
        const user = await api.users.getUserById(user_id);
        if ((user) && !(await TwitchBot.IsBotInChannel(user.name))) {
            redirect_uri = '/start';
        }
        else {
            redirect_uri = '/draft';
        }

    } catch (error) {
        console.log(error);
    };

    throw redirect(302, redirect_uri)
}