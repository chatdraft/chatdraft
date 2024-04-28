import { GetAllOtdCards } from '$lib/server/cardsHandler';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const cards = await GetAllOtdCards();

	return json(cards);
};
