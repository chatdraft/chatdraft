import { fetchSession } from '$lib/server/sessionHandler';
import type { Handle } from '@sveltejs/kit';
import { ApiClient } from '@twurple/api';
import { env } from "$env/dynamic/private";
import { RefreshingAuthProvider } from '@twurple/auth';
import { PUBLIC_TWITCH_OAUTH_CLIENT_ID } from '$env/static/public';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import TwitchBot from '$lib/server/twitchBot';
import { Listener } from '$lib/snap/draft';

const KV = new Map();

const auth_provider = new RefreshingAuthProvider({
	clientId: PUBLIC_TWITCH_OAUTH_CLIENT_ID,
	clientSecret: env.TWITCH_CLIENT_SECRET
});

export const handle: Handle = async ({ event, resolve }) => {
	event.	locals.KV = KV;
	event.locals.auth_provider = auth_provider;

	if (!auth_provider.hasUser(env.TWITCH_USER_ID) && existsSync(`./tokens.${env.TWITCH_USER_ID}.json`)) {
		const tokenData = JSON.parse(await readFile(`./tokens.${env.TWITCH_USER_ID}.json`, { encoding: 'utf-8' }));
		auth_provider.addUser(env.TWITCH_USER_ID, tokenData, ['chat:read','chat:edit']);
		TwitchBot.getInstance(auth_provider, Listener)
	}

	const session_id = event.cookies.get('session_id');

	if (session_id) {
		const session = fetchSession(session_id);

		if (session) {
			event.locals.session = { id: session_id };

			if (!auth_provider.hasUser(session.user_id)) {
				auth_provider.addUser(session.user_id, session.token);
			}

			const api = new ApiClient({authProvider: auth_provider})

			// Get the user's data using the access token
			event.locals.user = await api.users.getAuthenticatedUser(session.user_id)

			return await resolve(event);
		}
	}

	event.locals.session = null;
	event.locals.user = null;
	return await resolve(event);
};
