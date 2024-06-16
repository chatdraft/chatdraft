import type { PageServerLoad } from './$types';
import { GetAllCards } from '$lib/server/cardsHandler';
import { Draft } from '$lib/snap/draft';
import { ClearOneTimeDraft, GetOneTimeDraft, SetOneTimeDraft } from '$lib/server/draftHandler';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { minutes_to_ms } from '$lib/constants';
import { LookupCard } from '$lib/snap/cards';
import { OtdStatus } from '$lib/snap/draft';
import { GetOtdStatus } from '$lib/server/otdraft';

export const load = (async (request) => {
	const draftCode = request.url.searchParams.get('code');
	if (!draftCode) {
		return { draftCode: draftCode, validCode: false };
	}

	const draft = await prisma.oneTimeDraft.GetOneTimeDraft(draftCode);
	if (!draft) {
		return {
			draftCode: draftCode,
			validCode: false
		};
	}
	const draftStatus = GetOtdStatus(draft);
	const liveDraft = GetOneTimeDraft(draftCode);
	if (liveDraft) {
		if (
			liveDraft.startTime &&
			Date.now() - liveDraft.startTime > draft.batch.draftExpiration * minutes_to_ms
		) {
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
	if (draftStatus == OtdStatus.LinkExpired) {
		return {
			draftCode: draftCode,
			validCode: true,
			linkExpired: true,
			expiration: draft.batch.expiration
		};
	}
	if (draftStatus == OtdStatus.DraftExpired) {
		return {
			draftCode: draftCode,
			validCode: true,
			draftExpired: true,
			startedAt: draft.startedAt,
			expiredAt: new Date(draft.startedAt!.getTime() + draft.batch.draftExpiration * minutes_to_ms)
		};
	}
	if (draft?.cards) {
		type cardCode = { CardDefId: string };
		const obj = { Cards: Array<cardCode>() };
		const cards = JSON.parse(draft.cards) as string[];
		cards.forEach((card) => obj.Cards.push({ CardDefId: card }));

		const lookup = await Promise.all(
			cards.map(async (card) => LookupCard((await GetAllCards()).all, card))
		);
		return {
			draftCode: draftCode,
			deckCode: btoa(JSON.stringify(obj)),
			validCode: true,
			cards: lookup,
			startedAt: draft.startedAt,
			finishedAt: draft.finishedAt
		};
	}

	if (draftStatus == OtdStatus.Started) {
		return {
			validCode: true,
			startedAt: draft.startedAt,
			user: draft.user,
			draftStarted: true,
			draftCode: draftCode
		};
	}

	return {
		draftCode: draftCode,
		validCode: true,
		draftExpired: false,
		draftExpiration: draft.batch.draftExpiration
	};
}) satisfies PageServerLoad;

export const actions = {
	startDraft: async ({ request }) => {
		const form = await request.formData();
		const code = form.get('code')?.toString();
		const username = form.get('username')?.toString();
		if (code && username) {
			const existingDraft = await prisma.oneTimeDraft.GetOneTimeDraft(code);
			if (!existingDraft) throw error(404, 'Draft not found');
			if (existingDraft.startedAt)
				throw error(400, `Draft already started by ${existingDraft.user}`);
			const currentCards = await GetAllCards();
			const draftPool = existingDraft?.batch.cardPool.split(',') ?? null;
			const draft = new Draft('', 0, 6, currentCards.all, undefined, draftPool);
			await draft.StartDraft();
			SetOneTimeDraft(code, draft);
			await prisma.oneTimeDraft.StartOneTimeDraft(code, username);

			const draftExpiration_ms = existingDraft.batch.draftExpiration * minutes_to_ms;
			setTimeout(() => {
				const draft = GetOneTimeDraft(code);
				if (draft) {
					draft.CancelDraft();
					ClearOneTimeDraft(code);
					prisma.oneTimeDraft.CancelOneTimeDraft(code);
				}
			}, draftExpiration_ms);
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
