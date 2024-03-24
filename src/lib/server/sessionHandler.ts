
import crypto from 'crypto';
import type { AccessToken } from '@twurple/auth';
import { type Cookies, error } from '@sveltejs/kit';
import type { User } from '@prisma/client';

type TSessionID = string;

const sessionUsers = new Map<TSessionID, {token: AccessToken, user_id: string}>();
const sessionUserTimeouts = new Map<TSessionID, NodeJS.Timeout>();
const sessionTimeout = 1000 * 60 * 60 // 60 minutes

export function setSession(accessToken: AccessToken, user_id: string) {

    // Creating a new session ID that will be used as a cookie to authenticate the user in 
    const newSessionID: TSessionID = crypto.randomBytes(32).toString('hex');

    sessionUsers.set(newSessionID, {token: accessToken, user_id: user_id});

    const timeout = setTimeout(() => {
        deleteSession(newSessionID)
    }, sessionTimeout);

    sessionUserTimeouts.set(newSessionID, timeout);

    return newSessionID as TSessionID;
}

export function fetchSession(sessionId: TSessionID) {
    refreshTimeout(sessionId);

    return sessionUsers.get(sessionId);
}

export function ValidateSession(cookies: Cookies, user: User | null, session_key: string) {
	const session_id = cookies.get(session_key);
	if (!session_id || !user) {
		throw error(401, 'Not logged in.');
	}
	
	const session = fetchSession(session_id);
	if (session?.user_id != user?.twitchID) {
		throw error(403, 'Not authorized.');
	}
}

export function refreshTimeout(sessionId: string) {
    if (sessionUserTimeouts.has(sessionId)) {
        sessionUserTimeouts.get(sessionId)?.refresh();
    }
    else {
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
    const user_id = sessionUsers.get(sessionId)?.user_id || '';
    sessionUsers.set(sessionId, {token: accessToken, user_id: user_id });

    return sessionId as TSessionID;
}