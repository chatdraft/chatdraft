import { EventEmitter } from "@d-fischer/typed-event-emitter";
import type { Choice, Card, Deck } from "./draft";

export default class DraftListener extends EventEmitter {
    onDraftStarted = this.registerEvent<[player_channel: string]>();

    onNewChoice = this.registerEvent<[player_channel: string, choice: Choice]>();

    onChoiceSelected = this.registerEvent<[player_channel: string, card: Card]>();

    onDraftComplete = this.registerEvent<[player_channel: string, deck: Deck]>();

    onDraftCanceled = this.registerEvent<[player_channel: string]>();

    public DraftStarted(player_channel: string) {
        this.emit(this.onDraftStarted, player_channel)
    }

    public NewChoice(player_channel: string, choice: Choice) {
        this.emit(this.onNewChoice, player_channel, choice);
    }

    public ChoiceSelected(player_channel: string, card: Card) {
        this.emit(this.onChoiceSelected, player_channel, card);
    }

    public DraftComplete(player_channel: string, deck: Deck) {
        this.emit(this.onDraftComplete, player_channel, deck);
    }

    public DraftCanceled(player_channel: string) {
        this.emit(this.onDraftCanceled, player_channel);
    }
}