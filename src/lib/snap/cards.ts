export type Card = {
	cardDefKey: string;
	displayImageUrl: string;
	name: string;
	description: string;
	cost: number;
};

export type CardDb = {
	currentSeasonPassCardDefId: string;
	currentSpotlightCardDefId: string;
	all: {
		cardDefKey: string;
		variantKey: null;
		url: string;
		name: string;
		description: string;
		displayImageUrl: string;
		cost: number;
	}[];
};

export type Deck = Card[];

export function GetDeckCode(deck: Deck) {
	type cardCode = { CardDefId: string };
	const obj = { Cards: Array<cardCode>() };
	deck
		.toSorted((a, b) => a.cost - b.cost)
		.forEach((card) => obj.Cards.push({ CardDefId: card.cardDefKey }));
	return btoa(JSON.stringify(obj));
}

/**
 * Returns the Card for a given cardDefKey
 *
 * @private
 * @param {(string | undefined | null)} cardDefKey The cardDefKey
 * @returns {Card} The Card
 */
export function LookupCard(cards: { cardDefKey: string }[], cardDefKey: string | null) {
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

export function IntersectionOfCollections(collections: (string[] | null)[]): string[] | null {
	if (collections.length == 0) return null;
	const intersection = collections.reduce((intersection, collection) => {
		if (!intersection && !collection) {
			return null;
		}
		if (!intersection) {
			return collection;
		}
		if (!collection) {
			return intersection;
		}
		return intersection.filter((card) => collection.includes(card));
	});
	if (intersection) return [...intersection];

	return null;
}

export function CalculateExcludedCards(
	cardDb: CardDb,
	includedCards: string[] | undefined = undefined,
	removedCards: string[] = []
) {
	return cardDb.all.filter(
		(card) =>
			removedCards.includes(card.cardDefKey) ||
			(includedCards && includedCards.every((card2) => card2 != card.cardDefKey))
	);
}

export async function ParseCollectionState(collectionData: {
	ServerState: { Cards: { CardDefId: string }[] };
}) {
	return collectionData.ServerState.Cards.map(
		(card: { CardDefId: string }) => card.CardDefId
	).filter((value: string, index: number, array: string[]) => array.indexOf(value) === index);
}
