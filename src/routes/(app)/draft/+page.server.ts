import { redirect, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { EndDraft, GetDraft, GetPreviousDraft } from '$lib/server/draftHandler';
import DraftFactory from '$lib/snap/draftFactory';

export const load = (async ({ locals }) => {
  if (locals.user && !locals.user.isAuthorized) throw redirect(302, '/');

  if (locals.user?.channelName) {
    const draft = GetDraft(locals.user?.channelName);
    if (draft) {
      return {
        draft: draft.toIDraft(),
        choice: draft.currentChoice,
        draft_deck_code: draft.GetDeckCode(),
        botstatus: locals.user.userPreferences?.botJoinsChannel,
        player: draft.player,
        duration: locals.user.userPreferences?.draftRoundDuration,
        selectionCount: locals.user.userPreferences?.cardsPerRound,
        subsExtraVote: locals.user.userPreferences?.subsExtraVote,
      };
    }

    const prevdraft = GetPreviousDraft(locals.user.channelName);
    if (prevdraft) {
      return {
        draft: undefined,
        choice: undefined,
        botstatus: locals.user?.userPreferences?.botJoinsChannel,
        player: prevdraft.player,
        previous_draft: prevdraft.toIDraft(),
        prev_draft_deck_code: prevdraft.GetDeckCode(),
        duration: locals.user.userPreferences?.draftRoundDuration,
        selectionCount: locals.user.userPreferences?.cardsPerRound,
        subsExtraVote: locals.user.userPreferences?.subsExtraVote,
      };
    }

    return {
      draft: null,
      choice: null,
      botstatus: locals.user?.userPreferences?.botJoinsChannel,
      player: null,
      duration: locals.user.userPreferences?.draftRoundDuration,
      selectionCount: locals.user.userPreferences?.cardsPerRound,
      subsExtraVote: locals.user.userPreferences?.subsExtraVote,
    };
  }
}) satisfies PageServerLoad;

export const actions = {
  newDraft: async ({ locals, request }) => {
    if (locals.user && locals.user.twitchID) {
      const data = await request.formData();
      if (data) {
        const duration = Number(data.get('duration')?.toString());
        const selectionCount = Number(data.get('selectionCount')?.toString());
        const subsExtraVote = Boolean(data.get('subsExtraVote')?.toString());
        const collection = locals.user?.userPreferences?.collection
          ? JSON.parse(locals.user?.userPreferences.collection)
          : null;

        const draft = await DraftFactory.CreateDraft(
          locals.user!.channelName!,
          duration,
          selectionCount,
          subsExtraVote,
          collection
        );

        draft.StartDraft();
      }
    }
  },
  draftCard: async ({ locals, request }) => {
    if (locals.user && locals.user.twitchID) {
      const data = await request.formData();
      const selectionCardDefKey = data.get('selection')?.toString();
      const draft = GetDraft(locals.user!.channelName!);
      if (!draft || !draft.currentChoice) {
        throw error(404);
      }

      if (!selectionCardDefKey) {
        throw error(400);
      }

      if (
        draft.currentChoice.cards.some(
          (card) => card.cardDefKey == selectionCardDefKey
        )
      ) {
        draft.Choose(selectionCardDefKey, true);
      }
    }
  },
  cancelDraft: async ({ locals }) => {
    if (locals.user && locals.user.twitchID) {
      EndDraft(locals.user!.channelName!);
    }
  },
} satisfies Actions;
