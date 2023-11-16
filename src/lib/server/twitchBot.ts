import type { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { Vote, IsActive, type Choice, type Card, type Deck } from '$lib/snap/draft';
import type DraftListener from '$lib/snap/draftListener';

export default class TwitchBot {

    private static instance: TwitchBot;
    private chat: ChatClient;
    private listener;

    private constructor(authProvider: RefreshingAuthProvider, listener: DraftListener) {
        this.listener = listener;

        this.chat = new ChatClient({
            authProvider,
            channels: ['ssbmOro'],
            authIntents: ['chat:read', 'chat:edit']
        });
        this.chat.connect();

        this.chat.onMessage((channel, user, text) => {
            console.log(`#${channel} - <${user}>: ${text}`);

            if (['1','2','3'].includes(text) && IsActive(channel)) {
                Vote(channel, user, text);
            }
        });

        this.listener.onDraftStarted(TwitchBot.DraftStarted);
        this.listener.onNewChoice(TwitchBot.NewChoice);
        this.listener.onChoiceSelected(TwitchBot.ChoiceSelected);
        this.listener.onDraftComplete(TwitchBot.DraftComplete);
        this.listener.onDraftCanceled(TwitchBot.DraftCanceled)
    }

    public static Say(player_channel: string, text: string) {
        TwitchBot.instance.chat.say(player_channel, text);
    }

    public static getInstance(authProvider: RefreshingAuthProvider, listener: DraftListener): TwitchBot {
        if (!TwitchBot.instance) {
            TwitchBot.instance = new TwitchBot(authProvider, listener);
        }

        return TwitchBot.instance;
    }

    public static async DraftStarted(player_channel: string) {
        TwitchBot.Say(player_channel, "A new draft has started!");
    }

    public static async NewChoice(player_channel: string, choice: Choice) {
        await new Promise(f => setTimeout(f, 5000));
        TwitchBot.Say(player_channel, `The new choice is up! Select from ${choice.card1.name}, ${choice.card2.name}, or ${choice.card3.name}!`)
    }

    public static async ChoiceSelected(player_channel: string, card: Card) {
        TwitchBot.Say(player_channel, `${card.name} has been selected!`)
    }

    public static async DraftComplete(player_channel: string, deck: Deck) {
        TwitchBot.Say(player_channel, `The completed deck has been drafted: ${deck[0].name}, ${deck[1].name}, ${deck[2].name}, ${deck[3].name}, ${deck[4].name}, ${deck[5].name}, ${deck[6].name}, ${deck[7].name}, ${deck[8].name}, ${deck[9].name}, ${deck[10].name}, ${deck[11].name}.`)
    }

    public static async DraftCanceled(player_channel: string) {
        TwitchBot.Say(player_channel, 'The draft has been canceled.')
    }
}