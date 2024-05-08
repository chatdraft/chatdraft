export type Card = {
	cardDefKey: string;
	displayImageUrl: string;
	name: string;
	description: string;
	cost: number;
};

export type Deck = Card[];

export function GetDeckCode(deck: Deck) {
	type cardCode = { CardDefId: string };
	const obj = { Cards: Array<cardCode>() };
	deck.forEach((card) => obj.Cards.push({ CardDefId: card.cardDefKey }));
	return btoa(JSON.stringify(obj));
}

/**
 * Returns the Card for a given cardDefKey
 *
 * @private
 * @param {(string | undefined | null)} cardDefKey The cardDefKey
 * @returns {Card} The Card
 */
export async function LookupCard(cards: { cardDefKey: string }[], cardDefKey: string | null) {
	const placeholder = {
		cardDefKey: '',
		displayImageUrl: '/Placeholder.webp',
		cost: 9,
		description: '',
		name: '',
		url: '',
		variantKey: null
	};
	if (!cardDefKey) return placeholder;
	const card = cards.find((card) => card.cardDefKey == cardDefKey) as Card;
	return card || placeholder;
}
