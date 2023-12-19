import type { PageServerLoad } from './$types';
import { GetPreviewStatus } from '$lib/server/previewHandler';
import { GetPreviewDraft } from '$lib/snap/draft';

export const load = (async ( {params }) => {
    const player: string = params.player;
    const previewStatus = GetPreviewStatus(player);
    const previewDraft = GetPreviewDraft();

    return { previewStatus: previewStatus, previewDraft: previewDraft };
}) satisfies PageServerLoad;