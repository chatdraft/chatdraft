import type { PageServerLoad } from './$types';

export const load = (async ({locals}) => {
    return { user_unauthorized: locals.user && !locals.user_authorized};
}) satisfies PageServerLoad;