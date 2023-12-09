import { error, json, type RequestHandler } from '@sveltejs/kit';
import { GetDraft, GetPreviousDraft } from '$lib/snap/draft';
import { ValidateSession } from '$lib/server/sessionHandler';
import DraftFactory from '$lib/snap/draftFactory';
import type IDraft from '$lib/snap/draft';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	let draft: IDraft | undefined;
	if (url.searchParams.get('previous')) {
		draft = GetPreviousDraft(locals.user?.name || '');
	}
	else {
		draft = GetDraft(locals.user?.name || '');
	}
	if (!draft) throw error(404);

	return json({cards: draft.cards, total: draft.total, player: draft.player, currentChoice: draft.currentChoice, duration: draft.duration, selections: draft.selections, deckName: draft.deckName });
};

export const POST: RequestHandler = async ({ locals, cookies, url }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	let duration = 120;
	let selections = 3;

	if (url.searchParams.has('duration')) duration = +url.searchParams.get('duration')!
	if (url.searchParams.has('selections')) selections = +url.searchParams.get('selections')!

	const draft = DraftFactory.CreateDraft(duration, selections)

	draft.StartDraft(locals.user!.name);

	return new Response(null, { status: 204 } );
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	const draft = GetDraft(locals.user!.name);
	draft?.CancelDraft();

	return new Response(null, { status: 204 } );
}