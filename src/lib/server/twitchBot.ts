import type { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { type Choice, type Card, type Deck, GetDraft } from '$lib/snap/draft';

export default class TwitchBot {

    private static instance: TwitchBot;
    private chat: ChatClient | undefined;

    private constructor(authProvider: RefreshingAuthProvider) {
        this.chat = new ChatClient({
            authProvider,
            channels: [],
            authIntents: ['chat:read', 'chat:edit']
        });
        this.chat.connect();

        this.chat.onMessage((channel, user, text) => {
            console.log(`#${channel} - <${user}>: ${text}`);

            const draft = GetDraft(channel);

            if (!draft) return;

            if (['1','2','3'].includes(text) && draft.IsActive()) {
                draft.Vote(user, text);
            }
        });
    }

    public static IsInitialized() {
        return (this.instance && this.instance.chat)
    }

    public static IsConnected() {
        return (this.instance && this.instance.chat && this.instance.chat.isConnected)
    }

    public static Say(player_channel: string, text: string) {
        if (TwitchBot.instance.chat) TwitchBot.instance.chat.say(player_channel, text);
    }

    public static getInstance(authProvider: RefreshingAuthProvider): TwitchBot {
        if (!TwitchBot.instance) {
            TwitchBot.instance = new TwitchBot(authProvider);
        }

        return TwitchBot.instance;
    }

    public static async DraftStarted(player_channel: string) {
        TwitchBot.Say(player_channel, "A new draft has started!");
    }

    public static async NewChoice(player_channel: string, choice: Choice, vote_duration: number) {
        TwitchBot.Say(player_channel, `The new choice is up! You have ${vote_duration} seconds! Select from ${choice.card1.name}, ${choice.card2.name}, or ${choice.card3.name}!`);
    }

    public static async ChoiceSelected(player_channel: string, card: Card) {
        TwitchBot.Say(player_channel, `${card.name} has been selected!`);
    }

    public static async DraftComplete(player_channel: string, deck: Deck) {
        TwitchBot.Say(player_channel, `The completed deck has been drafted: ${deck.join(', ')}.`);
    }

    public static async DraftCanceled(player_channel: string) {
        TwitchBot.Say(player_channel, 'The draft has been canceled.')
    }

    public static async VotingClosed(player_channel: string, result: string, ties: string[]) {
        if (ties.length > 0) {
            TwitchBot.Say(player_channel, `Voting closed! There was a tie between ${ties.join(', ')}. The randomly chosen card is ${result}.`);
        }
        else {
            TwitchBot.Say(player_channel, `Voting closed! The winning card is ${result}.`);
        }
    }

    public static async ChoiceOverride(player_channel: string, result: string) {
        TwitchBot.Say(player_channel, `${player_channel} overrode the vote and selected ${result}!`)
    }

    public static async IsBotInChannel(player_channel: string) {
        if (!TwitchBot.instance.chat) return false;
        return TwitchBot.instance.chat.currentChannels.includes(`#${player_channel}`);
    }

    public static async JoinChannel(player_channel: string) {
        if (!TwitchBot.instance.chat) return false;
        return TwitchBot.instance.chat.join(player_channel)
    }
}