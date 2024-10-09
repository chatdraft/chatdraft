import {
	ChoiceSelected,
	DraftCanceled,
	DraftComplete,
	DraftStarted,
	LobbyDraftComplete,
	LobbyDraftPoolUpdated,
	LobbyDraftRoundOver,
	LobbyUpdated,
	NewChoice,
	VotingClosed
} from '$lib/server/webSocketUtils';
import { Draft } from './draft';
import { ParseCollectionBlob, type FullUser } from '$lib/server/db';
import { type CardDb, type Deck, IntersectionOfCollections } from '$lib/snap/cards';
import { seconds_to_ms } from '$lib/constants';
import { shuffle } from './utils';
import { DatetimeNowUtc } from '$lib/datetime';
import { type FeaturedCardMode } from '$lib/featuredCard';

export type Player = {
	name: string;
	fullUser: FullUser | undefined;
	collection: string[] | null;
};

export function CreateUserPlayer(fullUser: FullUser): Player {
	return {
		name: fullUser.channelName,
		fullUser: fullUser,
		collection: ParseCollectionBlob(fullUser.userPreferences?.collection)
	};
}

export function CreateGuestPlayer(playerName: string): Player {
	return {
		name: playerName,
		fullUser: undefined,
		collection: null
	};
}

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
	featuredCardMode: string;
	featuredCardDefKey: string;
	roundEndsAt: number;
	closedDeckList: boolean;
	draftedDecks: Map<string, Deck> | undefined;
	faceDownDraft: boolean;
}

/**
 * TODO: Describe CubeDraft
 *
 * @export
 * @class CubeDraft
 * @typedef {CubeDraft}
 */
export default class CubeDraft {
	private _drafts: Draft[] = [];

	private _draftPool:
		| {
				cardDefKey: string;
				variantKey: null;
				url: string;
				name: string;
				description: string;
				displayImageUrl: string;
				cost: number;
		  }[] = [];

	private _roundTimer: NodeJS.Timeout | undefined;

	private _draftedCardDefKeys: string[] = [];

	private _decks: Map<string, Deck> = new Map();

	private _players: Player[];

	private _started: boolean = false;

	private _finished: boolean = false;

	private _roundEndsAt: number = 0;

	public get lobbyName(): string {
		return this._lobbyName;
	}

	public get creator(): Player {
		return this._creator;
	}

	public get players(): Player[] {
		return this._players;
	}

	public get duration(): number {
		return this._duration;
	}

	public get selections(): number {
		return this._selections;
	}

	public get draftPool():
		| {
				cardDefKey: string;
				variantKey: null;
				url: string;
				name: string;
				description: string;
				displayImageUrl: string;
				cost: number;
		  }[] {
		return this._draftPool;
	}

	public get featuredCardMode(): FeaturedCardMode {
		return this._featuredCardMode;
	}

	public get featuredCardDefKey(): string {
		return this._featuredCardDefKey;
	}

	public get drafts(): Draft[] {
		return this._drafts;
	}

	public get started(): boolean {
		return this._started;
	}

	public get finished(): boolean {
		return this._finished;
	}

	public get roundEndsAt(): number {
		return this._roundEndsAt;
	}

	public get closedDeckList(): boolean {
		return this._faceDownDraft;
	}

	/**
	 * Creates an instance of a draft
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} _lobbyName The lobby name
	 * @param {Player[]} _players The players involved in the draft
	 * @param {number} _duration The duration of each voting period
	 * @param {number} _selections The number of selections per voting period
	 */
	constructor(
		private _lobbyName: string,
		private _creator: Player,
		private _duration: number,
		private _selections: number,
		private _cardPool: CardDb,
		private _featuredCardMode: FeaturedCardMode = 'off',
		private _featuredCardDefKey: string = '',
		private _faceDownDraft: boolean = true
	) {
		this._players = [_creator];
		this.updateCardPool();
	}

	private async CreatePlayerDrafts() {
		this.updateCardPool();

		for (const player of this.players) {
			const draft = new Draft(
				player.name,
				0,
				this.selections,
				this.draftPool,
				undefined,
				undefined,
				undefined,
				this.featuredCardMode,
				this.featuredCardDefKey,
				this.lobbyName,
				0
			);

			draft.onDraftStarted(DraftStarted);

			draft.onDraftCanceled(DraftCanceled);

			draft.onNewChoice(NewChoice);

			draft.onChoiceSelected(ChoiceSelected);

			draft.onDraftComplete(async (draft) => {
				DraftComplete(draft.player, draft.lobbyName, draft.cards);
			});

			draft.onVotingClosed(VotingClosed);

			this.drafts.push(draft);

			this._decks.set(draft.player, []);
		}
	}

	private updateCardPool() {
		const previousDraftPool = [...this.draftPool];
		const cardPoolDefKeys = IntersectionOfCollections(
			this.players.map((player) => player.collection)
		);
		if (this.featuredCardMode != 'off' && this.featuredCardDefKey) {
			cardPoolDefKeys?.push(this.featuredCardDefKey);
		}
		this._draftPool = cardPoolDefKeys
			? this._cardPool.all.filter((card) => cardPoolDefKeys.includes(card.cardDefKey))
			: this._cardPool.all;

		if (
			this._draftPool.length != previousDraftPool.length ||
			!this.draftPool.every((val, index) => val == previousDraftPool[index])
		) {
			LobbyDraftPoolUpdated(this.lobbyName);
		}
	}

	public async AddUserPlayer(user: FullUser) {
		if (this.started) return;
		this.players.push(CreateUserPlayer(user));
		LobbyUpdated(this.lobbyName);
		this.updateCardPool();
	}

	public async AddGuestPlayer(playerName: string) {
		if (this.started) return;
		this.players.push(CreateGuestPlayer(playerName));
		LobbyUpdated(this.lobbyName);
		this.updateCardPool();
	}

	public async RemoveUserPlayer(user: FullUser) {
		if (this.started) return;
		const index = this.players.findIndex((player) => {
			return player.fullUser?.twitchID == user.twitchID;
		});
		if (index > -1) {
			this.players.splice(index, 1);
			LobbyUpdated(this.lobbyName);
			this.updateCardPool();
		}
	}

	public async RemoveGuestPlayer(playerName: string) {
		if (this.started) return;
		const index = this.players.findIndex((player) => {
			return player.name == playerName;
		});
		if (index > -1) {
			this.players.splice(index, 1);
			LobbyUpdated(this.lobbyName);
			this.updateCardPool();
		}
	}

	public async UpdateUserPlayerCollection(fullUser: FullUser, collection: string | null) {
		const player = this.players.find((player) => player.fullUser?.twitchID == fullUser.twitchID);
		if (player) {
			player.collection = ParseCollectionBlob(collection);
		}
		this.updateCardPool();
	}

	public async StartDraft() {
		if (this.started) return;
		this._started = true;
		await this.CreatePlayerDrafts();
		this.CreateNewChoices();
		await Promise.all(this.drafts.map((draft) => draft.StartDraft(false)));
		this.RestartRoundTimer();
	}

	private RestartRoundTimer() {
		this.ClearRoundTimer();
		const voting_period_ms = this.duration * seconds_to_ms; // voting period in ms
		this._roundTimer = setTimeout(async () => {
			await this.CloseRound();
		}, voting_period_ms);
	}

	private ClearRoundTimer() {
		if (this._roundTimer) {
			clearTimeout(this._roundTimer);
			this._roundTimer = undefined;
		}
	}

	public async CloseRound() {
		if (!this.started) return;
		const draftedCards = await Promise.all(this.drafts.map((draft) => draft.CloseVoting(false)));
		for (const draft of this.drafts) {
			this._decks.set(draft.player, draft.cards);
		}
		this._draftedCardDefKeys.push(
			...draftedCards.filter((card) => card.winner).map((card) => card.winner!.cardDefKey)
		);

		const sampleDeck = this._decks.values().next().value;
		if (sampleDeck && sampleDeck.length < 12) {
			this.CreateNewChoices();
			this.RestartRoundTimer();
			await LobbyDraftRoundOver(this.lobbyName);
		} else {
			this._finished = true;
			await Promise.all(
				this.drafts.map((draft) => DraftComplete(draft.player, draft.lobbyName, draft.cards))
			);
			await LobbyDraftComplete(this.lobbyName);
		}
	}

	private async CreateNewChoices() {
		const available = this.draftPool.filter((c) =>
			this._draftedCardDefKeys.every((e) => e != c.cardDefKey)
		);
		const shuffledDeck = shuffle(available);

		const roundStart = DatetimeNowUtc();
		await Promise.all(
			this.drafts.map(
				async (draft) =>
					(draft.currentChoice = await draft.NewChoice(roundStart, this.duration, shuffledDeck))
			)
		);
		const votes_closed = this.drafts[0].currentChoice?.votes_closed;
		if (votes_closed) this._roundEndsAt = votes_closed;
	}

	public async Vote(playerName: string, choice: string) {
		this.drafts.find((draft) => draft.player == playerName)?.Vote(playerName, choice, false);
	}

	public async CancelDraft() {
		this.ClearRoundTimer();

		for (const draft of this.drafts) draft.CancelDraft();
	}

	public toICubeDraft(): ICubeDraft {
		return {
			lobbyName: this.lobbyName,
			creator: this.creator,
			players: this.players,
			started: this.started,
			finished: this.finished,
			duration: this.duration,
			selections: this.selections,
			draftPool: this.draftPool,
			featuredCardMode: this.featuredCardMode,
			featuredCardDefKey: this.featuredCardDefKey,
			roundEndsAt: this.roundEndsAt,
			closedDeckList: this.closedDeckList,
			draftedDecks: this.closedDeckList ? undefined : this._decks,
			faceDownDraft: this._faceDownDraft
		};
	}
}
