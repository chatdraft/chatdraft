import type { Handle } from '@sveltejs/kit';

const KV = new Map();

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.KV = KV;

	const response = await resolve(event);
	return response;
};
