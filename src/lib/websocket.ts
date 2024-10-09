import { DatetimeNowUtc } from './datetime';

/**
 * Establishes a websocket connection. Typically this will be called
 * from the client running in the browser/browser source.
 *
 * @async
 * @param {(message: string) => Promise<void>} handleMessage Function called to handle each message received from the Websocket
 * @param {(string | undefined)} [player=undefined] Channel name of the twitch channel this websocket is associated with
 * @param {(string | undefined)} [hide=undefined] Which parts of the draft this websocket connection is hiding if any
 * @returns {Promise<void>, player?: string, hide?: string) => unknown}
 */
export const establishWebSocket = async (
	handleMessage: (message: string) => Promise<void>,
	player: string | undefined = undefined,
	hide: string | undefined = undefined,
	lobby: string | undefined = undefined
) => {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const uri = new URL(`${protocol}//${window.location.host}/websocket`);
	if (player) uri.pathname += `/${player}`;
	if (hide) uri.searchParams.append('hide', hide);
	if (lobby) uri.searchParams.append('lobby', lobby);

	let ws = new WebSocket(uri);
	heartbeat(ws);
	ws.onmessage = async (event) => {
		await handleMessage(event.data);
	};

	ws.onclose = async () => {
		setTimeout(async () => {
			ws = await establishWebSocket(handleMessage);
		}, 5000);
	};

	return ws;
};

/**
 * Starts and continues a heartbeat function that pings the server every 500 ms
 *
 * @param {(WebSocket | null)} [ws=null] Websocket to start a heartbeat on
 */
function heartbeat(ws: WebSocket | null = null) {
	setTimeout(() => heartbeat(ws), 500);
	if (!ws) return;
	if (ws.readyState !== ws.OPEN) return;

	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.Ping,
		timestamp: DatetimeNowUtc()
	};
	ws.send(JSON.stringify(wsm));
}

/**
 * A websocket message
 *
 * @export
 * @typedef {WebSocketMessage}
 */
export type WebSocketMessage = {
	type: WebSocketMessageType;
	timestamp: number;
	message?: string;
};

/**
 * Websocket message type
 *
 * @export
 * @enum {string}
 */
export enum WebSocketMessageType {
	Ping = 'ping',
	Pong = 'pong',
	Connect = 'connect',
	Channel = 'channel',
	BrowserSource = 'browsersource',
	DraftStarted = 'draftstarted',
	NewChoice = 'newchoice',
	ChoiceSelected = 'choiceselected',
	DraftComplete = 'draftcomplete',
	DraftCanceled = 'draftcanceled',
	VotingClosed = 'votingclosed',
	ChoiceOverride = 'choiceoverride',
	PreviewToggled = 'previewtoggled',
	BrowserUpdated = 'browserupdated',
	ShowDeck = 'showdeck',
	VoteUpdated = 'voteupdated',
	BattlerSelected = 'battlerselected',
	OpacityUpdated = 'opacityupdated',
	LobbyDraftPoolUpdated = 'lobbydraftpoolupdated',
	LobbyName = 'lobbyname',
	LobbyDraftRoundOver = 'lobbydraftroundover',
	LobbyDraftComplete = 'lobbydraftcomplete',
	LobbyUpdated = 'lobbyupdated',
	LobbyClosed = 'lobbyclosed'
}
