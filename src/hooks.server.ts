import { fetchSession } from '$lib/server/sessionHandler';
import type { Handle } from '@sveltejs/kit';
import { ApiClient } from '@twurple/api';
import { env } from '$env/dynamic/private';
import { RefreshingAuthProvider } from '@twurple/auth';
import { PUBLIC_TWITCH_OAUTH_CLIENT_ID } from '$env/static/public';
import TwitchBot from '$lib/server/twitchBot';
import { existsToken, loadToken } from '$lib/server/tokenHandler';
import { GlobalThisWSS, type ExtendedGlobal } from '$lib/server/webSocketHandler';
import { building } from '$app/environment';
import cookie from 'cookie';
import { userAuthorized } from '$lib/server/authorizationHandler';

const KV = new Map();

const auth_provider = new RefreshingAuthProvider({
	clientId: PUBLIC_TWITCH_OAUTH_CLIENT_ID,
	clientSecret: env.TWITCH_CLIENT_SECRET
});



let wssInitialized = false;
export const startupWebsocketServer = () => {
	if (wssInitialized) return;
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.on('connection', async (ws, request) => {
			// This is where you can authenticate the client from the request
			const cookies = cookie.parse(request.headers.cookie || '');
			if (cookies.session_id) {
				const session_id = cookies.session_id;
				const session = fetchSession(session_id);
				if (session) {
					ws.userId = session.user_id;
					ws.sessionId = session_id;
					const api = new ApiClient({ authProvider: auth_provider });
					ws.player_channel = (await api.users.getUserById(session.user_id))?.name;
				}
			}

			const url_components = request.url?.split('/')

			if ((url_components) &&(url_components?.length > 2)) {
				ws.player_channel = url_components[2]
			}

			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			ws.send(`Hello from SvelteKit ${new Date().toLocaleString()} (${ws.socketId})]`);

			ws.on('close', () => {
				console.log(`[wss:kit] client disconnected (${ws.socketId})`);
			});
		});
		wssInitialized = true;
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.KV = KV;

	event.locals.auth_provider = auth_provider;
	startupWebsocketServer();
	// Skip WebSocket server when pre-rendering pages
	if (!building) {
		const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (wss !== undefined) {
			event.locals.wss = wss;
		}
	}


	if (!auth_provider.hasUser(env.TWITCH_USER_ID) && existsToken(env.TWITCH_USER_ID)) {
		const tokenData = await loadToken(env.TWITCH_USER_ID);
		auth_provider.addUser(env.TWITCH_USER_ID, tokenData, ['chat:read', 'chat:edit']);
		TwitchBot.getInstance(auth_provider);
	}

	const session_id = event.cookies.get('session_id');

	if (session_id) {
		const session = fetchSession(session_id);

		if (session) {
			event.locals.session = { id: session_id };

			if (!auth_provider.hasUser(session.user_id)) {
				auth_provider.addUser(session.user_id, session.token);
			}

			const api = new ApiClient({ authProvider: auth_provider });

			// Get the user's data using the access token
			event.locals.user = await api.users.getAuthenticatedUser(session.user_id);
			event.locals.user_authorized = await userAuthorized(event.locals.user.name);

			return await resolve(event);
		}
	}

	event.locals.session = null;
	event.locals.user = null;
	event.locals.user_authorized = false;
	
	const response = await resolve(event, {
		filterSerializedResponseHeaders: name => name === 'content-type',
	});

	return response;
};
