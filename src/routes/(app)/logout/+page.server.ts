import { deleteSession } from '$lib/server/sessionHandler';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({cookies}) => {
    if (cookies.get('session_id')) {
        deleteSession(cookies.get('session_id')!);
        cookies.delete('session_id', {path: '/', httpOnly: true })
    }

    throw redirect(302, '/');
}) satisfies PageServerLoad;