import { parse } from 'url';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import type WebSocketBase from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { refreshTimeout } from './sessionHandler';
import { WebSocketMessageType, type WebSocketMessage } from '../websocket';
import { DatetimeNowUtc } from '../datetime';

export const GlobalThisWSS = Symbol.for('sveltekit.wss');

declare class ExtendedWebSocket extends WebSocketBase {
	socketId: string;
	userId: string;
	sessionId: string;
	player_channel: string;
	lobbyName: string;
}

export type { ExtendedWebSocket };

export type ExtendedWebSocketServer = WebSocketBase.Server<typeof ExtendedWebSocket>;

export type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]: ExtendedWebSocketServer;
};

export const onHttpServerUpgrade = (req: IncomingMessage, sock: Duplex, head: Buffer) => {
	const pathname = req.url ? parse(req.url).pathname : null;
	if (!pathname?.startsWith('/websocket')) return;

	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];

	wss.handleUpgrade(req, sock, head, (ws) => {
		console.log('[handleUpgrade] creating new connecttion');

		wss.emit('connection', ws, req);
	});
};

export const createWSSGlobalInstance = () => {
	const wss = new WebSocketServer({
		noServer: true,
		perMessageDeflate: false
	}) as unknown as ExtendedWebSocketServer;

	(globalThis as ExtendedGlobal)[GlobalThisWSS] = wss;

	wss.on('connection', (ws: ExtendedWebSocket) => {
		ws.socketId = nanoid();
		console.log(`[wss:global] client connected (${ws.socketId})`);

		ws.on('close', () => {
			console.log(`[wss:global] client disconnected (${ws.socketId})`);
		});
		ws.on('message', (event) => {
			refreshTimeout(ws.sessionId);
			try {
				const message: WebSocketMessage = JSON.parse(event.toString());
				if (message.type == WebSocketMessageType.Ping) {
					const wsm: WebSocketMessage = {
						type: WebSocketMessageType.Pong,
						timestamp: DatetimeNowUtc()
					};
					ws.send(JSON.stringify(wsm));
				}
			} catch (error) {
				let message = 'Unknown Error';
				if (error instanceof Error) message = error.message;
				console.log(message);
			}
		});
	});

	return wss;
};
