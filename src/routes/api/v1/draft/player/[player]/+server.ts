import { error, json, type RequestHandler } from '@sveltejs/kit';
import { GetDraft, GetPreviousDraft } from '$lib/server/draftHandler';
import type IDraft from '$lib/snap/draft';

export const GET: RequestHandler = async ({ params, url }) => {
  if (!params.player) {
    throw error(400);
  }

  let draft: IDraft | undefined;
  if (url.searchParams.get('previous')) {
    draft = GetPreviousDraft(params.player);
  } else {
    draft = GetDraft(params.player);
  }

  if (!draft) throw error(404);

  return json({
    cards: draft.cards,
    total: draft.total,
    player: draft.player,
    currentChoice: draft.currentChoice,
    duration: draft.duration,
    selections: draft.selections,
    deckName: draft.deckName,
  });
};
