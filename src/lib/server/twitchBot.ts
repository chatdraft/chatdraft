import type { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import Draft, { type Choice, type Card, type Deck, GetDraft, GetPreviousDraft } from '$lib/snap/draft';
import { env } from '$env/dynamic/private';

export default class TwitchBot {

    private static instance: TwitchBot;
    private chat: ChatClient | undefined;
    private bot: Bot | undefined;

    private constructor(authProvider: RefreshingAuthProvider) {
        this.chat = new ChatClient({
            authProvider,
            channels: [],
            authIntents: ['chat:read', 'chat:edit']
        });
        this.chat.connect();

        authProvider.addIntentsToUser(env.TWITCH_USER_ID, ['chat']);

        this.bot = new Bot({authProvider, channels: [], 
            commands: [
                createBotCommand('chatdraft', async (_,{say}) => 
                    await say(`Help  draft a deck and I'll play it! A random choice of cards will be presented and chat will vote on which card gets added to the deck. Type the number to vote!`)),
                createBotCommand('chatdraftstart', async (params, {broadcasterName, msg}) => {
                    if (msg.userInfo.isMod || msg.userInfo.isBroadcaster) {
                        const duration = Number(params[0]);
                        const draft = new Draft({
                            DraftStarted: TwitchBot.DraftStarted,
                            DraftCanceled: TwitchBot.DraftCanceled,
                            NewChoice: TwitchBot.NewChoice,
                            ChoiceSelected: TwitchBot.ChoiceSelected,
                            DraftComplete: TwitchBot.DraftComplete,
                            VotingClosed: TwitchBot.VotingClosed,
                            ChoiceOverride: TwitchBot.ChoiceOverride,
                        }, duration);
                    
                        draft.StartDraft(broadcasterName);
                    }
                }),
                createBotCommand('chatdraftcancel', async (_, {broadcasterName, msg}) => {
                    if (msg.userInfo.isMod || msg.userInfo.isBroadcaster) {
                        GetDraft(broadcasterName)?.CancelDraft();
                    }
                }),
                createBotCommand('chatdraftdeck', async (_, {broadcasterName, reply}) => {
                    const previousDraft = GetPreviousDraft(broadcasterName);
                    if (previousDraft) {
                        reply(Draft.GetDeckCode(previousDraft.cards));
                    }
                }, {globalCooldown: 30, userCooldown: 60})
            ]});

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

    public static Action(player_channel: string, text: string) {
        if (TwitchBot.instance.chat) TwitchBot.instance.chat.action(player_channel, text);
    }

    public static getInstance(authProvider: RefreshingAuthProvider): TwitchBot {
        if (!TwitchBot.instance) {
            TwitchBot.instance = new TwitchBot(authProvider);
        }

        return TwitchBot.instance;
    }

    public static async DraftStarted(player_channel: string) {
        TwitchBot.Say(player_channel, "A new draft has started! Type 1, 2, or 3 to vote for the card you want to draft!");
    }

    public static async NewChoice(player_channel: string, choice: Choice) {
        TwitchBot.Say(player_channel, `Vote (1) ${choice.card1.name} (2) ${choice.card2.name} (3) ${choice.card3.name}`);
    }

    public static async ChoiceSelected(player_channel: string, card: Card) {
        TwitchBot.Action(player_channel, `${card.name} has been selected!`);
    }

    public static async DraftComplete(player_channel: string, deck: Deck) {
        TwitchBot.Say(player_channel, `The completed deck has been drafted: ${deck.map((card) => card.name).join(', ')}.`);
    }

    public static async DraftCanceled(player_channel: string) {
        TwitchBot.Say(player_channel, 'The draft has been canceled.')
    }

    public static async VotingClosed(player_channel: string, result: string, ties: string[]) {
        if (ties.length > 0) {
            TwitchBot.Action(player_channel, `${result} chosen after tie between ${ties.join(', ')}.`);
        }
        else {
            TwitchBot.Action(player_channel, `${result} was drafted!`);
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
        if (TwitchBot.instance.bot) TwitchBot.instance.bot.join(player_channel);
        return TwitchBot.instance.chat.join(player_channel)
    }
}