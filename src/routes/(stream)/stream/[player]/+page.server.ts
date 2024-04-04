import type { PageServerLoad } from './$types';
import { GetPreviewStatus } from '$lib/server/previewHandler';
import { GetPreviewDraft } from '$lib/server/draftHandler';

export const load = (async ( {params, locals }) => {
    const player: string = params.player;
    const previewStatus = GetPreviewStatus(player);
    const previewDraft = await GetPreviewDraft();


    return { previewStatus: previewStatus, previewDraft: previewDraft, bgOpacity: locals.user?.userPreferences?.bgOpacity };
}) satisfies PageServerLoad;