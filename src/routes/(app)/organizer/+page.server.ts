import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import { GetOtdStatus } from '$lib/server/otdraft';

export const load = (async ({ locals }) => {
	if (!locals.user || (!locals.user.isAdmin && !locals.user.isOrganizer)) throw redirect(302, '/');
	if (locals.user.isAdmin) {
		const otdBatches = await prisma.oneTimeDraftBatch.GetAllOneTimeDraftBatches();
		return { otdBatches: otdBatches };
	} else {
		const otdBatches = await prisma.oneTimeDraftBatch.GetOneTimeDraftBatchesByOrganizer(
			locals.user.id
		);
		return { otdBatches: otdBatches };
	}
}) satisfies PageServerLoad;

export const actions = {
	viewOtdBatch: async ({ request }) => {
		const data = await request.formData();
		const otdBatchTagData = data.get('otdraftBatchTag');
		if (!otdBatchTagData) return fail(400, { otdBatchTagMissing: true });
		const otdBatchTag = otdBatchTagData.toString();
		const otdBatch = await prisma.oneTimeDraftBatch.GetOneTimeBatch(otdBatchTag);
		const otdStatuses = otdBatch?.drafts.map((draft) =>
			GetOtdStatus({ ...draft, batch: otdBatch })
		);
		return { otdBatch: otdBatch, otdStatuses: otdStatuses };
	}
} satisfies Actions;
