import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({locals}) => {
    if (locals.user && !locals.user_authorized) throw redirect(302, '/');
    return {};
}) satisfies PageServerLoad;