import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	event.depends('chatdraft:auth');
	if (event.locals.user) {
		return { user: event.locals.user };
	}
	return { user: null };
};
