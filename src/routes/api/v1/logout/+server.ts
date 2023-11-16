import { deleteSession } from '$lib/server/sessionHandler';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ( { cookies} ) => {

    if (cookies.get('session_id')) {
        deleteSession(cookies.get('session_id')!);
        cookies.delete('session_id', {path: '/', httpOnly: true })
    }

    throw redirect(302, '/');
}