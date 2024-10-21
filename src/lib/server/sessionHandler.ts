import crypto from 'crypto';
import type { AccessToken } from '@twurple/auth';
import { type Cookies, error } from '@sveltejs/kit';
import { sessionTimout_ms } from '../constants';
import type { User, UserAuthorization } from '@prisma/client';
import type { FullUser } from '$lib/user';

type TSessionID = string;

const sessionUsers = new Map<TSessionID, { token: AccessToken; user: FullUser }>();
const sessionUserTimeouts = new Map<TSessionID, NodeJS.Timeout>();
const sessionTimeout = sessionTimout_ms;

export function setSession(accessToken: AccessToken, user: FullUser) {
	// Creating a new session ID that will be used as a cookie to authenticate the user in
	const newSessionID: TSessionID = crypto.randomBytes(32).toString('hex');

	sessionUsers.set(newSessionID, { token: accessToken, user: user });

	const timeout = setTimeout(() => {
		deleteSession(newSessionID);
	}, sessionTimeout);

	sessionUserTimeouts.set(newSessionID, timeout);

	return newSessionID as TSessionID;
}

export function fetchSession(sessionId: TSessionID) {
	refreshTimeout(sessionId);

	return sessionUsers.get(sessionId);
}

export function ValidateSession(cookies: Cookies, user: FullUser, session_key: string) {
	const session_id = cookies.get(session_key);
	if (!session_id || !user) {
		throw error(401, 'Not logged in.');
	}

	const session = fetchSession(session_id);
	if (session?.user?.twitchID != user?.twitchID) {
		throw error(403, 'Not authorized.');
	}
}

export function refreshTimeout(sessionId: string) {
	if (sessionUserTimeouts.has(sessionId)) {
		sessionUserTimeouts.get(sessionId)?.refresh();
	} else {
		const timeout = setTimeout(() => {
			deleteSession(sessionId);
		}, sessionTimeout);
		sessionUserTimeouts.set(sessionId, timeout);
	}
}

export function deleteSession(sessionId: TSessionID) {
	sessionUsers.delete(sessionId);
}

export function updateSession(sessionId: TSessionID, accessToken: AccessToken) {
	refreshTimeout(sessionId);
	const user = sessionUsers.get(sessionId)?.user;
	if (user) sessionUsers.set(sessionId, { token: accessToken, user: user });

	return sessionId as TSessionID;
}

export function updateUserAuthorization(user: User & { authorization: UserAuthorization | null }) {
	const sessionUser = Array.from(sessionUsers.values()).find(
		(session) => user.id == session?.user.id
	);
	if (sessionUser) {
		sessionUser.user.authorization = user.authorization;
		sessionUser.user.isAdmin = user.isAdmin;
		sessionUser.user.isOrganizer = user.isOrganizer;
	}
}
