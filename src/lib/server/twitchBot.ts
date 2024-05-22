import type { AuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import type { Choice, Draft } from '$lib/snap/draft';
import { env } from '$env/dynamic/public';
import DraftFactory from '$lib/snap/draftFactory';
import { SendMessage } from './webSocketUtils';
import { prisma } from './db';
import { EndDraft, GetDraft, GetPreviousDraft, IsActive } from './draftHandler';
import { WebSocketMessageType, type WebSocketMessage } from '$lib/websocket';
import { DatetimeNowUtc } from '$lib/datetime';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ApiClient } from '@twurple/api';
import { type Card, type Deck, GetDeckCode } from '$lib/snap/cards';

/**
 * Represents the singleton instance of the Chat Draft Twitch Bot
 *
 * @export
 * @class TwitchBot
 * @typedef {TwitchBot}
 */
export default class TwitchBot {
	private static instance: TwitchBot;
	private bot: Bot | undefined;
	private api: ApiClient | undefined;
	private eventSub: EventSubWsListener | undefined;
	private authProvider: AuthProvider | undefined;

	/**
	 * Creates an instance of TwitchBot.
	 *
	 * @constructor
	 * @private
	 * @param {RefreshingAuthProvider} authProvider The refreshing auth provider used to connect to Twitch Chat
	 * @param {string[]} channels List of channels to connect to
	 */
	private constructor(authProvider: RefreshingAuthProvider, channels: string[]) {
		this.authProvider = authProvider;
		authProvider.addIntentsToUser(env.PUBLIC_TWITCH_USER_ID!, ['chat']);

		this.bot = new Bot({
			authProvider,
			channels: channels,
			chatClientOptions: { rejoinChannelsOnReconnect: true },
			commands: [
				createBotCommand(
					'chatdraft',
					async (_, { say }) =>
						await say(
							`Oro Chat Draft presents a random selection of cards for chat to vote on. Chat picks 12 unique cards, drafting a completed deck. To use Chat Draft, inquire at twitch.tv/jjrolk.`
						)
				),
				createBotCommand('chatdraftstart', async (params, { broadcasterName, msg }) => {
					if (msg.userInfo.isMod || msg.userInfo.isBroadcaster) {
						const preferences = await prisma.userPreference.GetUserPreference(broadcasterName);
						let duration = Number(params[0]);
						if (!duration) {
							duration = preferences ? preferences.draftRoundDuration : 90;
						}

						let selections = Number(params[1]);
						if (!selections) {
							selections = preferences ? preferences.cardsPerRound : 6;
						}

						const subsBonusText = params[2];
						let subsBonus = false;
						if (subsBonusText) {
							subsBonus = subsBonusText == 'true';
						} else {
							subsBonus = preferences ? preferences.subsExtraVote : false;
						}

						const collection = preferences?.collection ? JSON.parse(preferences?.collection) : null;

						const draft = await DraftFactory.CreateDraft(
							broadcasterName,
							duration,
							selections,
							subsBonus,
							collection
						);

						draft.StartDraft();
					}
				}),

				createBotCommand('chatdraftcancel', async (_, { broadcasterName, msg }) => {
					if (msg.userInfo.isMod || msg.userInfo.isBroadcaster) {
						EndDraft(broadcasterName);
					}
				}),

				createBotCommand(
					'chatdraftdeck',
					async (_, { broadcasterName }) => {
						const previousDraft = GetPreviousDraft(broadcasterName);
						if (previousDraft) {
							const wsm: WebSocketMessage = {
								type: WebSocketMessageType.ShowDeck,
								timestamp: DatetimeNowUtc()
							};
							SendMessage(broadcasterName, wsm);
						}
					},
					{ globalCooldown: 30, userCooldown: 60 }
				),

				createBotCommand(
					'chatdraftcode',
					async (_, { broadcasterName, reply }) => {
						const currentDraft = GetDraft(broadcasterName);
						if (currentDraft?.total == 12) {
							reply(currentDraft.GetDeckCode());
						} else {
							const previousDraft = GetPreviousDraft(broadcasterName);
							if (previousDraft) {
								reply(previousDraft.GetDeckCode());
							}
						}
					},
					{ globalCooldown: 30, userCooldown: 60 }
				)
			]
		});
	}

	/**
	 * Initializes the bot to tally votes when 1-6 are typed in chat
	 * and check the channel connection when the broadcaster goes live to
	 * ensure the bot is in the channel if it failed to connect earlier.
	 *
	 * @private
	 * @async
	 * @param {string[]} channels - List of channels to join
	 * @returns {*}
	 */
	private async Init(channels: string[]) {
		this.bot?.chat.onMessage((channel, user, text, msg) => {
			console.log(`#${channel} - <${user}>: ${text}`);

			const draft = GetDraft(channel);

			if (!draft) return;

			if (['1', '2', '3', '4', '5', '6'].includes(text) && IsActive(draft.player)) {
				draft.Vote(user, text, msg.userInfo.isSubscriber);
				const wsm: WebSocketMessage = {
					type: WebSocketMessageType.VoteUpdated,
					timestamp: DatetimeNowUtc()
				};
				SendMessage(channel, wsm);
			}
		});

		this.api = new ApiClient({ authProvider: this.authProvider! });
		this.eventSub = new EventSubWsListener({ apiClient: this.api });
		const users = await this.api.users.getUsersByNames(channels);
		users.forEach(async (user) => {
			this.eventSub?.onStreamOnline(user.id, (event) => {
				if (!TwitchBot.IsBotInChannel(event.broadcasterName))
					console.warn(
						`${event.broadcasterName} has gone live. Bot is expected to be in their channel but was not.`
					);
			});
		});
	}

	/**
	 * Checks if the Twitch Bot is healthy
	 *
	 * @public
	 * @returns {boolean} True if the bot exists and is connected to Twitch Chat
	 */
	public IsHealthy() {
		return this.bot && this.bot.chat.isConnected;
	}

	/**
	 * Checks if the Twitch Bot is initialized
	 *
	 * @public
	 * @static
	 * @returns {boolean} True if the bot instance exists and has a chat instance
	 */
	public static IsInitialized() {
		return this.instance && this.instance.bot;
	}

	/**
	 * Checks if the Twitch Bot is connected
	 *
	 * @public
	 * @static
	 * @returns {boolean} True if the bot instance exists and has a chat instance and the chat instance is connected.
	 */
	public static IsConnected() {
		return this.instance && this.instance.bot && this.instance.bot.chat.isConnected;
	}

	/**
	 * Say the given text in the given channel
	 *
	 * @public
	 * @static
	 * @param {string} player_channel Twitch channel to say the message
	 * @param {string} text Message to say
	 */
	public static Say(player_channel: string, text: string) {
		if (TwitchBot.instance.bot) TwitchBot.instance.bot.say(player_channel, text);
	}

	/**
	 * Act the given text in the given channel (appears italicized in Twitch chat)
	 *
	 * @public
	 * @static
	 * @param {string} player_channel Twitch channel to act the message
	 * @param {string} text Message to act
	 */
	public static Action(player_channel: string, text: string) {
		if (TwitchBot.instance.bot) TwitchBot.instance.bot.action(player_channel, text);
	}

	public static async Message(userName: string, text: string) {
		if (TwitchBot.instance.bot) {
			try {
				await TwitchBot.instance.bot.whisper(userName, text);
			} catch (error) {
				console.log(error);
				return false;
			}
			return true;
		}
		return false;
	}

	/**
	 * Gets or creates the Twitch Bot instance
	 *
	 * @public
	 * @static
	 * @async
	 * @param {RefreshingAuthProvider} authProvider Twitch Bot auth credentials
	 * @returns {Promise<TwitchBot>} Twitch Bot Instance
	 */
	public static async getInstance(authProvider: RefreshingAuthProvider): Promise<TwitchBot> {
		if (!TwitchBot.instance) {
			const channels = await prisma.user.GetChannels();
			TwitchBot.instance = new TwitchBot(authProvider, channels);
			await TwitchBot.instance.Init(channels);
		}

		return TwitchBot.instance;
	}

	/**
	 * Announces that a new draft has started in the given channel.
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to say the message
	 * @returns {*}
	 */
	public static async DraftStarted(
		player_channel: string,
		battleChatter: string | undefined = undefined
	) {
		if (battleChatter) {
			TwitchBot.Say(
				player_channel,
				`A new draft has started vs @${battleChatter}! Type the number to vote for the card you want to draft!`
			);
			const canWhisper = await TwitchBot.Message(
				battleChatter,
				`Your chat draft battle has started in ${player_channel}'s channel!`
			);
			if (!canWhisper) {
				TwitchBot.Say(
					player_channel,
					`@${battleChatter}: Unable to Whisper. Please follow chatdraftbot to receive your deck code after draft.`
				);
			}
		} else {
			TwitchBot.Say(
				player_channel,
				'A new draft has started! Type the number to vote for the card you want to draft!'
			);
		}
	}

	/**
	 * Announces that a new choice is available in the given channel
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to say the message
	 * @param {Choice} choice The current choice of the draft
	 * @returns {*}
	 */
	public static async NewChoice(player_channel: string, choice: Choice) {
		let expression = 'Vote ';
		choice.cards.forEach((card, index) => (expression += `(${index + 1}) ${card.name} `));
		TwitchBot.Say(player_channel, expression);
	}

	/**
	 * Announces which card has been selected in the draft's vote.
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to say the message
	 * @param {Card} card The winning card
	 * @returns {*}
	 */
	public static async ChoiceSelected(
		player_channel: string,
		card: Card,
		battleChatter: string | undefined = undefined,
		battleCard: Card | undefined = undefined,
		battlerCardRandom: boolean | undefined = undefined
	) {
		TwitchBot.Action(player_channel, `${card.name} has been selected!`);
		if (battleChatter && battleCard) {
			if (battlerCardRandom) {
				TwitchBot.Action(
					player_channel,
					`@${battleChatter} has randomly picked ${battleCard.name}`
				);
			} else {
				TwitchBot.Action(player_channel, `@${battleChatter} has drafted ${battleCard.name}`);
			}
		}
	}

	/**
	 * Announces when the draft has been completed.
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to say the message
	 * @param {Deck} deck The completed deck
	 * @returns {*}
	 */
	public static async DraftComplete(
		player_channel: string,
		deck: Deck,
		battleChatter: string | undefined = undefined,
		battleDeck: Deck | undefined = undefined
	) {
		TwitchBot.Say(
			player_channel,
			`The completed deck has been drafted: ${deck.map((card) => card.name).join(', ')}.`
		);
		if (battleChatter && battleDeck) {
			TwitchBot.Say(
				player_channel,
				`@${battleChatter} has drafted: ${battleDeck.map((card) => card.name).join(', ')}.`
			);
			await TwitchBot.Message(battleChatter, `Your drafted deck code: ${GetDeckCode(battleDeck)}`);
		}
	}

	/**
	 * Announces that the draft has been canceled
	 *
	 * @public
	 * @static
	 * @async
	 * @param {Draft} draft The draft that was canceled (twitch channel is inferred from this)
	 * @returns {*}
	 */
	public static async DraftCanceled(draft: Draft) {
		TwitchBot.Say(draft.player, 'The draft has been canceled.');
	}

	/**
	 * Announces that voting has closed for the given player's draft.
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to say the message
	 * @param {string} result The name of the card that won
	 * @param {string[]} ties The list of ties (if any)
	 * @returns {*}
	 */
	public static async VotingClosed(
		player_channel: string,
		result: string,
		ties: string[],
		battleChatter: string | undefined = undefined,
		battleCard: Card | undefined = undefined,
		battlerCardRandom: boolean | undefined = undefined
	) {
		if (ties.length > 1) {
			TwitchBot.Action(player_channel, `${result} chosen after tie between ${ties.join(', ')}.`);
		} else {
			TwitchBot.Action(player_channel, `${result} was drafted!`);
		}

		if (battleChatter && battleCard) {
			if (battlerCardRandom) {
				TwitchBot.Action(
					player_channel,
					`@${battleChatter} has randomly picked ${battleCard.name}`
				);
			} else {
				TwitchBot.Action(player_channel, `@${battleChatter} has drafted ${battleCard.name}`);
			}
		}
	}

	/**
	 * Announces that the player has overrided chat's vote and selected a card
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to say the message
	 * @param {string} result The card that was selected
	 * @returns {*}
	 */
	public static async ChoiceOverride(
		player_channel: string,
		result: string,
		battleChatter: string | undefined = undefined,
		battleCard: string | undefined = undefined,
		battlerCardRandom: boolean | undefined = undefined
	) {
		TwitchBot.Say(player_channel, `${player_channel} overrode the vote and selected ${result}!`);
		if (battleChatter && battleCard) {
			if (battlerCardRandom) {
				TwitchBot.Action(player_channel, `@${battleChatter} has randomly picked ${battleCard}`);
			} else {
				TwitchBot.Action(player_channel, `@${battleChatter} has drafted ${battleCard}`);
			}
		}
	}

	/**
	 * Checks whether the bot is currently connected to the given player's channel
	 *
	 * @public
	 * @static
	 * @param {string} player_channel Twitch channel to check
	 * @returns {boolean} False if the instance is not connected to twitch, or if it is not connected to the channel
	 */
	public static IsBotInChannel(player_channel: string) {
		if (!TwitchBot.instance || !TwitchBot.instance.bot) return false;
		return TwitchBot.instance.bot.chat.currentChannels.includes(`#${player_channel}`);
	}

	/**
	 * Instructs the bot to join the given player channel
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to join
	 * @returns {boolean} True if the channel was successfully joined.
	 */
	public static async JoinChannel(player_channel: string) {
		if (!TwitchBot.instance || !TwitchBot.instance.bot) return false;
		if (TwitchBot.instance.bot) await TwitchBot.instance.bot.join(player_channel);
		return true;
	}

	/**
	 * Instructs the bot to part the given player channel.
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel Twitch channel to part
	 * @returns {boolean} True if the channel was successfully joined.
	 */
	public static async PartChannel(player_channel: string) {
		if (TwitchBot.instance.bot) await TwitchBot.instance.bot.leave(player_channel);
		return true;
	}
}
