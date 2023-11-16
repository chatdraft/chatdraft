
import crypto from 'crypto';
import type { AccessToken } from '@twurple/auth';

type TSessionID = string;

const sessionUsers = new Map<TSessionID, {token: AccessToken, user_id: string}>();
const sessionUserTimeouts = new Map<TSessionID, NodeJS.Timeout>();

export function setSession(accessToken: AccessToken, user_id: string) {

    // Creating a new session ID that will be used as a cookie to authenticate the user in 
    const newSessionID: TSessionID = crypto.randomBytes(32).toString('hex');

    sessionUsers.set(newSessionID, {token: accessToken, user_id: user_id});

    const timeout = setTimeout(() => {
        deleteSession(newSessionID)
    }, 1000 * 60 * 10) //  10 minutes

    sessionUserTimeouts.set(newSessionID, timeout);

    return newSessionID as TSessionID;
}

export function fetchSession(sessionId: TSessionID) {
    refreshTimeout(sessionId);

    return sessionUsers.get(sessionId);
}

export function fetchClientSession(sessionId: TSessionID) {
    refreshTimeout(sessionId);

    const session = sessionUsers.get(sessionId);
    if (!session) return null;

    return session;
}

function refreshTimeout(sessionId: string) {
    if (sessionUserTimeouts.has(sessionId)) {
        sessionUserTimeouts.get(sessionId)?.refresh();
    }
    else {
        const timeout = setTimeout(() => {
            deleteSession(sessionId);
        }, 1000 * 60 * 10); //  10 minutes
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