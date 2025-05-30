import { setSession, updateSession } from '$lib/server/sessionHandler';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env as privateenv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import TwitchBot from '$lib/server/twitchBot';
import { ApiClient } from '@twurple/api';
import { prisma } from '$lib/server/db';
import {
	ClearExpiredLoginRequests,
	IsLoginRequestExpired,
	PopLoginRequest
} from '$lib/server/loginHandler';

const authProvider = new RefreshingAuthProvider({
	clientId: env.PUBLIC_TWITCH_OAUTH_CLIENT_ID,
	clientSecret: privateenv.TWITCH_CLIENT_SECRET
});

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
	const code = url.searchParams.get('code');
	if (!code) throw error(400, 'No code provided.');

	const state = url.searchParams.get('state');
	if (!state) {
		throw error(401, 'Invalid login in request.');
	}
	const loginRequest = PopLoginRequest(state);
	if (!loginRequest) {
		throw error(401, 'Invalid login in request.');
	}
	if (IsLoginRequestExpired(loginRequest)) {
		ClearExpiredLoginRequests();
		throw error(401, 'Login request expired.');
	}

	const redirectUri = loginRequest.redirectUri;

	try {
		// Get the authentication object using the user's code
		const tokenData = await exchangeCode(
			env.PUBLIC_TWITCH_OAUTH_CLIENT_ID,
			privateenv.TWITCH_CLIENT_SECRET,
			code,
			env.PUBLIC_TWITCH_REDIRECT_URI
		);

		const user_id = await authProvider.addUserForToken(tokenData);

		if (tokenData.scope.includes('chat:read') && tokenData.scope.includes('chat:edit')) {
			await prisma.token.SaveToken(user_id, tokenData);
			authProvider.addUser(env.PUBLIC_TWITCH_USER_ID, tokenData, ['chat:read', 'chat:edit']);
			TwitchBot.getInstance(authProvider);
			locals.auth_provider.addUserForToken(tokenData);
		}

		// Optionally, you can upsert the user in the DB here
		const api = new ApiClient({ authProvider });

		// Get the user's data using the access token and upsert to db
		const twitch_user = await api.users.getAuthenticatedUser(user_id);
		const user = await prisma.user.UpdateUser(twitch_user);

		if (user) {
			// Create new session for the user
			const session_id = setSession(tokenData, user);
			authProvider.onRefresh(async (_userId, newTokenData) => {
				updateSession(session_id, newTokenData);
			});

			// set the session cookie
			cookies.set('session_id', session_id, {
				path: '/',
				httpOnly: true,
				maxAge: tokenData.expiresIn!
			});
		}
	} catch (error) {
		console.log(error);
	}

	throw redirect(302, redirectUri);
};
