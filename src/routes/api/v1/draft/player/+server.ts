import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ValidateSession } from '$lib/server/sessionHandler';
import DraftFactory from '$lib/snap/draftFactory';
import type IDraft from '$lib/snap/draft';
import { EndDraft, GetDraft, GetPreviousDraft } from '$lib/server/draftHandler';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	let draft: IDraft | undefined;
	if (url.searchParams.get('previous')) {
		draft = GetPreviousDraft(locals.user?.channelName || '');
	}
	else {
		draft = GetDraft(locals.user?.channelName || '');
	}
	if (!draft) throw error(404);

	return json({cards: draft.cards, total: draft.total, player: draft.player, currentChoice: draft.currentChoice, duration: draft.duration, selections: draft.selections, deckName: draft.deckName });
};

export const POST: RequestHandler = async ({ locals, cookies, url }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	let duration = 120;
	let selections = 3;
	let subsExtraVote = false;

	if (url.searchParams.has('duration')) duration = +url.searchParams.get('duration')!
	if (url.searchParams.has('selections')) selections = +url.searchParams.get('selections')!
	if (url.searchParams.has('subsExtraVote')) subsExtraVote = url.searchParams.get('subsExtraVote') == 'true';

	const draft = await DraftFactory.CreateDraft(locals.user!.channelName!, duration, selections, subsExtraVote)

	draft.StartDraft();

	return new Response(null, { status: 204 } );
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	EndDraft(locals.user!.channelName!);

	return new Response(null, { status: 204 } );
}