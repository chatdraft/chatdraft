import { BrowserSourceUpdated } from './webSocketUtils';

interface IBrowserSourceInstances {
	full_sources: string[];
	deck_sources: string[];
	choice_sources: string[];
}

const browserSourceStatuses = new Map<string, IBrowserSourceInstances>();

/**
 * Register that the websocket connection has closed for the given websocket ID
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 * @param {string} websocket_id Websocket ID of the websocket
 */
export function CloseBrowserSource(channel_name: string, websocket_id: string) {
	if (browserSourceStatuses.has(channel_name)) {
		browserSourceStatuses.get(channel_name)?.full_sources.forEach((ws_id, index) => {
			if (ws_id == websocket_id) {
				browserSourceStatuses.get(channel_name)?.full_sources.splice(index, 1);
			}
		});
		browserSourceStatuses.get(channel_name)?.deck_sources.forEach((ws_id, index) => {
			if (ws_id == websocket_id) {
				browserSourceStatuses.get(channel_name)?.deck_sources.splice(index, 1);
			}
		});
		browserSourceStatuses.get(channel_name)?.choice_sources.forEach((ws_id, index) => {
			if (ws_id == websocket_id) {
				browserSourceStatuses.get(channel_name)?.choice_sources.splice(index, 1);
			}
		});
		BrowserSourceUpdated(
			channel_name,
			IsFullSourceConfigured(channel_name),
			IsDeckSourceConfigured(channel_name),
			IsChoiceSourceConfigured(channel_name)
		);
	}
}

/**
 * Register a Full Browser Source websocket connection has been created.
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 * @param {string} websocket_id Websocket ID of the websocket
 */
export function RegisterFullBrowserSource(channel_name: string, websocket_id: string) {
	if (!browserSourceStatuses.has(channel_name)) {
		browserSourceStatuses.set(channel_name, {
			full_sources: [websocket_id],
			deck_sources: [],
			choice_sources: []
		});
	} else {
		browserSourceStatuses.get(channel_name)!.full_sources.push(websocket_id);
	}
	BrowserSourceUpdated(
		channel_name,
		IsFullSourceConfigured(channel_name),
		IsDeckSourceConfigured(channel_name),
		IsChoiceSourceConfigured(channel_name)
	);
}

/**
 * Register a Deck Browser Source websocket connection has been created.
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 * @param {string} websocket_id Websocket ID of the websocket
 */
export function RegisterDeckBrowserSource(channel_name: string, websocket_id: string) {
	if (!browserSourceStatuses.has(channel_name)) {
		browserSourceStatuses.set(channel_name, {
			full_sources: [],
			deck_sources: [websocket_id],
			choice_sources: []
		});
	} else {
		if (!browserSourceStatuses.get(channel_name)!.deck_sources) {
			browserSourceStatuses.get(channel_name)!.deck_sources = [];
		}
		browserSourceStatuses.get(channel_name)!.deck_sources.push(websocket_id);
	}
	BrowserSourceUpdated(
		channel_name,
		IsFullSourceConfigured(channel_name),
		IsDeckSourceConfigured(channel_name),
		IsChoiceSourceConfigured(channel_name)
	);
}

/**
 * Register a Choice Browser Source websocket connection has been created.
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 * @param {string} websocket_id Websocket ID of the websocket
 */
export function RegisterChoiceBrowserSource(channel_name: string, websocket_id: string) {
	if (!browserSourceStatuses.has(channel_name)) {
		browserSourceStatuses.set(channel_name, {
			full_sources: [],
			deck_sources: [],
			choice_sources: [websocket_id]
		});
	} else {
		if (!browserSourceStatuses.get(channel_name)!.choice_sources) {
			browserSourceStatuses.get(channel_name)!.choice_sources = [];
		}
		browserSourceStatuses.get(channel_name)!.choice_sources.push(websocket_id);
	}
	BrowserSourceUpdated(
		channel_name,
		IsFullSourceConfigured(channel_name),
		IsDeckSourceConfigured(channel_name),
		IsChoiceSourceConfigured(channel_name)
	);
}

/**
 * Returns true if at least one full browser source is configured for the given channel.
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 */
export function IsFullSourceConfigured(channel_name: string) {
	return (
		browserSourceStatuses.has(channel_name) &&
		browserSourceStatuses.get(channel_name)!.full_sources.length > 0
	);
}

/**
 * Returns true if at least one deck browser source is configured for the given channel.
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 */
export function IsDeckSourceConfigured(channel_name: string) {
	return (
		browserSourceStatuses.has(channel_name) &&
		browserSourceStatuses.get(channel_name)!.deck_sources.length > 0
	);
}

/**
 * Returns true if at least one choices browser source is configured for the given channel.
 *
 * @export
 * @param {string} channel_name Twitch channel name the websocket is associated with
 */
export function IsChoiceSourceConfigured(channel_name: string) {
	return (
		browserSourceStatuses.has(channel_name) &&
		browserSourceStatuses.get(channel_name)!.choice_sources.length > 0
	);
}
