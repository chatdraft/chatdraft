import { error, json, type RequestHandler } from '@sveltejs/kit';
import { GetDraft, StartDraft, CancelDraft } from '$lib/snap/draft';
import { fetchSession } from '$lib/server/sessionHandler';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id || !locals.user) {
		throw error(401);
	}
	
	const session = fetchSession(session_id);
	if (session?.user_id != locals.user?.id) {
		throw error(403);
	}

	const draft = GetDraft(locals.user.name);
	if (!draft) throw error(404);

	return json(draft);
};

export const POST: RequestHandler = async ({ locals, cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id || !locals.user) {
		throw error(401);
	}
	
	const session = fetchSession(session_id);
	if (session?.user_id != locals.user?.id) {
		throw error(403);
	}

	StartDraft(locals.user?.name);

	return new Response(null, { status: 204 } );
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
	const session_id = cookies.get('session_id');
	if (!session_id || !locals.user) {
		throw error(401);
	}
	
	const session = fetchSession(session_id);
	if (session?.user_id != locals.user?.id) {
		throw error(403);
	}

	CancelDraft(locals.user.name);

	return new Response(null, { status: 204 } );
}