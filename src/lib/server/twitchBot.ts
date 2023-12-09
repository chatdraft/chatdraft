import type { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import Draft, { type Choice, type Card, type Deck, GetDraft, GetPreviousDraft } from '$lib/snap/draft';
import { env } from '$env/dynamic/public';
import DraftFactory from '$lib/snap/draftFactory';
import { SendMessage } from './webSocketUtils';
import { addChannel, getChannels, removeChannel } from './channelHandler';

export default class TwitchBot {

    private static instance: TwitchBot;
    private chat: ChatClient | undefined;
    private bot: Bot | undefined;

    private constructor(authProvider: RefreshingAuthProvider, channels: string[]) {
        this.chat = new ChatClient({
            authProvider,
            channels: channels,
            authIntents: ['chat:read', 'chat:edit']
        });
        this.chat.connect();

        authProvider.addIntentsToUser(env.PUBLIC_TWITCH_USER_ID, ['chat']);

        this.bot = new Bot({authProvider, channels: channels, 
            commands: [
                createBotCommand('chatdraft', async (_,{say}) => 
                    await say(`Help  draft a deck and I'll play it! A random choice of cards will be presented and chat will vote on which card gets added to the deck. Type the number to vote!`)),
                createBotCommand('chatdraftstart', async (params, {broadcasterName, msg, reply}) => {
                    if (msg.userInfo.isMod || msg.userInfo.isBroadcaster) {
                        const duration = Number(params[0]);
                        if (!duration) {
                            reply("No vote period specified.");
                            return;
                        }

                        const selections = Number(params[1]);
                        if (!selections) {
                            reply("No selection count specified.")
                        }
                        
                        const draft = DraftFactory.CreateDraft(duration, selections);
                    
                        draft.StartDraft(broadcasterName);
                    }
                }),
                createBotCommand('chatdraftcancel', async (_, {broadcasterName, msg}) => {
                    if (msg.userInfo.isMod || msg.userInfo.isBroadcaster) {
                        GetDraft(broadcasterName)?.CancelDraft();
                    }
                }),
                createBotCommand('chatdraftdeck', async (_, {broadcasterName}) => {
                    const previousDraft = GetPreviousDraft(broadcasterName);
                    if (previousDraft) {
                        SendMessage(broadcasterName, 'showdeck')
                    }
                }, {globalCooldown: 30, userCooldown: 60}),
                createBotCommand('chatdraftcode', async (_, {broadcasterName, reply}) => {
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

            if (['1','2','3','4','5','6'].includes(text) && draft.IsActive()) {
                draft.Vote(user, text);
                SendMessage(channel, 'voteupdated');
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

    public static async getInstance(authProvider: RefreshingAuthProvider): Promise<TwitchBot> {
        if (!TwitchBot.instance) {
            const channels = await getChannels();
            TwitchBot.instance = new TwitchBot(authProvider, channels);
        }

        return TwitchBot.instance;
    }

    public static async DraftStarted(player_channel: string) {
        TwitchBot.Say(player_channel, "A new draft has started! Type the number to vote for the card you want to draft!");
    }

    public static async NewChoice(player_channel: string, choice: Choice) {
        let expression = "Vote ";
        choice.cards.forEach((card, index) => expression += `(${index + 1}) ${card.name} `)
        TwitchBot.Say(player_channel, expression);
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
        if (ties.length > 1) {
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
        await addChannel(player_channel);
        return TwitchBot.instance.chat.join(player_channel)
    }

    public static async PartChannel(player_channel: string) {
        if (!TwitchBot.instance.chat) return false;
        if (TwitchBot.instance.bot) TwitchBot.instance.bot.leave(player_channel);
        await removeChannel(player_channel);
        return TwitchBot.instance.chat.part(player_channel);
    }
}