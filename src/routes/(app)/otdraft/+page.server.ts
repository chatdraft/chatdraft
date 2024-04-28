import type { PageServerLoad } from './$types';
import { GetAllOtdCards } from '$lib/server/cardsHandler';
import { Draft, LookupCard } from '$lib/snap/draft';
import { ClearOneTimeDraft, GetOneTimeDraft, SetOneTimeDraft } from '$lib/server/draftHandler';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { onehour_ms } from '$lib/constants';

export const load = (async (request) => {
	const draftCode = request.url.searchParams.get('code');
	if (!draftCode) {
		return { draftCode: draftCode, validCode: false };
	}

	const liveDraft = GetOneTimeDraft(draftCode);
	if (liveDraft) {
		if (liveDraft.startTime && Date.now() - liveDraft.startTime > onehour_ms) {
			return {
				draftCode: draftCode,
				validCode: true,
				draftExpired: true
			};
		}

		return {
			draftCode: draftCode,
			draft: liveDraft?.toIDraft(),
			validCode: true
		};
	}

	const draft = await prisma.oneTimeDraft.GetOneTimeDraft(draftCode);
	if (!draft) {
		return {
			draftCode: draftCode,
			validCode: false
		};
	}
	if (!draft.finishedAt && Date.now() > draft.batch.expiration.getTime()) {
		return {
			draftCode: draftCode,
			validCode: true,
			linkExpired: true,
			expiration: draft.batch.expiration
		};
	}
	if (!draft.finishedAt && draft.startedAt && Date.now() - draft.startedAt.getTime() > onehour_ms) {
		return {
			draftCode: draftCode,
			validCode: true,
			draftExpired: true
		};
	}
	if (draft?.cards) {
		type cardCode = { CardDefId: string };
		const obj = { Cards: Array<cardCode>() };
		const cards = JSON.parse(draft.cards) as string[];
		cards.forEach((card) => obj.Cards.push({ CardDefId: card }));

		const lookup = await Promise.all(cards.map((card) => LookupCard(card)));
		return {
			draftCode: draftCode,
			deckCode: btoa(JSON.stringify(obj)),
			validCode: true,
			cards: lookup,
			startedAt: draft.startedAt,
			finishedAt: draft.finishedAt
		};
	}

	return {
		draftCode: draftCode,
		validCode: true,
		draftExpired: false
	};
}) satisfies PageServerLoad;

export const actions = {
	startDraft: async ({ request }) => {
		const form = await request.formData();
		const code = form.get('code')?.toString();
		if (code) {
			const existingDraft = await prisma.oneTimeDraft.GetOneTimeDraft(code);
			if (existingDraft?.startedAt) throw error(400, 'Draft already started');
			const current_cards = await GetAllOtdCards();
			const draft = new Draft('', 0, 6, current_cards, undefined, null);
			await draft.StartDraft();
			SetOneTimeDraft(code, draft);
			await prisma.oneTimeDraft.StartOneTimeDraft(code);
			setTimeout(() => {
				const draft = GetOneTimeDraft(code);
				if (draft) {
					draft.CancelDraft();
					ClearOneTimeDraft(code);
					prisma.oneTimeDraft.CancelOneTimeDraft(code);
				}
			}, onehour_ms);
		}
	},
	draftCard: async ({ request }) => {
		const data = await request.formData();
		const selectionCardDefKey = data.get('selection')?.toString();
		const code = data.get('code')?.toString();
		if (!code) {
			throw error(400);
		}
		const draft = GetOneTimeDraft(code);
		if (!draft || !draft.currentChoice) {
			throw error(404);
		}

		if (!selectionCardDefKey) {
			throw error(400);
		}

		if (draft.currentChoice.cards.some((card) => card.cardDefKey == selectionCardDefKey)) {
			await draft.Choose(selectionCardDefKey, true);
		}

		if (draft.total == 12) {
			prisma.oneTimeDraft.FinishOneTimeDraft(
				code,
				JSON.stringify(draft.cards.map((card) => card.cardDefKey))
			);
			ClearOneTimeDraft(code);
		}
	}
};
