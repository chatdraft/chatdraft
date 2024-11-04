import type { FeaturedCardMode } from './featuredCard';
import type { Deck } from './snap/cards';
import type { Player } from './snap/player';

export interface ICubeDraft {
	lobbyName: string;
	creator: Player;
	players: Player[];
	started: boolean;
	finished: boolean;
	duration: number;
	selections: number;
	draftPool: {
		cardDefKey: string;
		variantKey: null;
		url: string;
		name: string;
		description: string;
		displayImageUrl: string;
		cost: number;
	}[];
	featuredCardMode: FeaturedCardMode;
	featuredCardDefKey: string;
	roundEndsAt: number;
	closedDeckList: boolean;
	draftedDecks: Map<string, Deck> | undefined;
	faceDownDraft: boolean;
	removedCards: string[];
	lockInRoundEndsAt: number | undefined;
	quickPick: boolean;
	currentRound: number;
}
