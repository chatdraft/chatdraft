import { twitch_login_uri } from '$lib/api/twitch/client';
import { minutes_to_ms } from '$lib/constants';
import { DatetimeNowUtc } from '$lib/datetime';
import { PushLoginRequest } from '$lib/server/loginHandler';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import * as crypto from 'node:crypto';

export const GET: RequestHandler = async (request) => {
	const redirectUri = request.url.searchParams.get('redirect') || '/';
	const stateToken = crypto.randomBytes(24).toString('base64url');
	const expiresOn = new Date(DatetimeNowUtc() + 2 * minutes_to_ms);

	PushLoginRequest(stateToken, { redirectUri: redirectUri, expiresOn: expiresOn });

	throw redirect(302, twitch_login_uri + stateToken);
};
