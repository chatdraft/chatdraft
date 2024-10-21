import type CubeDraft from '$lib/server/cubeDraft';
import type { FullUser } from '$lib/user';
import { LobbyClosed } from './webSocketUtils';

export const lobbies = new Map<string, CubeDraft>();

/**
 * Returns a list of currently active Drafts
 *
 * @export
 * @returns {CubeDraft[]} List of currently active drafts.
 */
export function GetLobbies() {
	return [...lobbies.values()];
}

/**
 * Gets the lobby for the given lobby name.
 *
 * @export
 * @param {string} lobbyName Lobby name
 * @returns {Lobby | undefined} The lobby
 */
export function GetLobby(lobbyName: string) {
	return lobbies.get(lobbyName);
}

export function SetLobby(lobby: CubeDraft) {
	lobbies.set(lobby.lobbyName, lobby);
}

export function UpdateUserCollection(user: FullUser, collection: string | null) {
	for (const lobby of lobbies.values()) {
		const playerInLobby = lobby.players.find(
			(player) => player.fullUser?.twitchID == user.twitchID
		);
		if (playerInLobby) lobby.UpdateUserPlayerCollection(user, collection);
	}
}

export async function CloseLobby(lobby: CubeDraft) {
	lobbies.delete(lobby.lobbyName);
	await LobbyClosed(lobby.lobbyName);
}
