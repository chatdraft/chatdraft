import { fetchSession } from '$lib/server/sessionHandler';
import type { Handle } from '@sveltejs/kit';
import { env as privateenv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import { RefreshingAuthProvider } from '@twurple/auth';
import TwitchBot from '$lib/server/twitchBot';
import { prisma } from '$lib/server/db';
import { GlobalThisWSS, type ExtendedGlobal } from '$lib/server/webSocketHandler';
import { building } from '$app/environment';
import cookie from 'cookie';
import { CloseBrowserSource, RegisterFullBrowserSource, RegisterDeckBrowserSource, RegisterChoiceBrowserSource } from '$lib/server/browserSourceHandler';
import { WebSocketMessageType, type WebSocketMessage } from '$lib/websocket';
import { DatetimeNowUtc } from '$lib/datetime';

const auth_provider = new RefreshingAuthProvider({
	clientId: env.PUBLIC_TWITCH_OAUTH_CLIENT_ID!,
	clientSecret: privateenv.TWITCH_CLIENT_SECRET!
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
				if (session && session.user) {
					ws.userId = session.user.id;
					ws.sessionId = session_id;
					ws.player_channel = session.user.channelName;
				}
			}

			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			const wsm : WebSocketMessage = {
				type: WebSocketMessageType.Connect,
				timestamp: DatetimeNowUtc(),
			}
			ws.send(JSON.stringify(wsm));
			ws.on('close', () => {
				console.log(`[wss:kit] client disconnected (${ws.socketId}, ${ws.player_channel})`);
				CloseBrowserSource(ws.player_channel, ws.socketId);
			});
			ws.on('message', (event) => {
				const wsm : WebSocketMessage = JSON.parse(event.toString());
				if (wsm.type == WebSocketMessageType.BrowserSource) {
					const hide = wsm.message;
					if (hide == '') {
						RegisterFullBrowserSource(ws.player_channel, ws.socketId);
					}
					else if (hide == 'choice') {
						RegisterDeckBrowserSource(ws.player_channel, ws.socketId);
					}
					else if (hide == 'deck') {
						RegisterChoiceBrowserSource(ws.player_channel, ws.socketId);
					}
				}
				if (wsm.type == WebSocketMessageType.Channel) {
					const channel = wsm.message!;
					ws.player_channel = channel;
				}
			});
		});

		wssInitialized = true;
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth_provider = auth_provider;
	startupWebsocketServer();
	// Skip WebSocket server when pre-rendering pages
	if (!building) {
		const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (wss !== undefined) {
			event.locals.wss = wss;
		}
	}

	if (!auth_provider.hasUser(env.PUBLIC_TWITCH_USER_ID!)) {
		const tokenData = await prisma.token.LoadToken(env.PUBLIC_TWITCH_USER_ID!);
		if (tokenData) {
			auth_provider.addUser(env.PUBLIC_TWITCH_USER_ID!, tokenData, ['chat:read', 'chat:edit']);
			TwitchBot.getInstance(auth_provider);
		}
	}

	const session_id = event.cookies.get('session_id');

	if (session_id) {
		const session = fetchSession(session_id);

		if (session) {
			event.locals.session = { id: session_id };

			if (session.user && !auth_provider.hasUser(session.user)) {
				auth_provider.addUser(session.user, session.token);
			}

			event.locals.user = session.user;
			
			return await resolve(event);
		}
	}

	event.locals.session = null;
	event.locals.user = null;
	
	event.cookies.delete('session_id', {path: '/', httpOnly: true });
	
	const response = await resolve(event, {
		filterSerializedResponseHeaders: name => name === 'content-type',
	});

	return response;
};
