import { setSession, updateSession } from '$lib/server/sessionHandler';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env as privateenv } from "$env/dynamic/private";
import { env } from "$env/dynamic/public";
import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import TwitchBot from '$lib/server/twitchBot';
import { ApiClient } from '@twurple/api';
import { DbSaveToken, DbUpdateUser } from '$lib/server/db'

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

        // Optionally, you can upsert the user in the DB here
        const api = new ApiClient({ authProvider });

        // Get the user's data using the access token and upsert to db
        const twitch_user = await api.users.getAuthenticatedUser(user_id);
        const user = await DbUpdateUser(twitch_user);

        // Create new session for the user
        const session_id = setSession(tokenData, user);
        authProvider.onRefresh(async (_userId, newTokenData) => {
            updateSession(session_id, newTokenData)
        });

        // set the session cookie
        cookies.set('session_id', session_id, {path: '/', httpOnly: true, sameSite: true, secure:true, maxAge: tokenData.expiresIn! })

        if ((user) && !user.initialSetupDone) {
            redirect_uri = '/start';
        }
        else if (user) {
            redirect_uri = '/draft';
        }

    } catch (error) {
        console.log(error);
    };

    throw redirect(302, redirect_uri)
}