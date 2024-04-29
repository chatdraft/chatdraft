import { PrismaClient } from '@prisma/client';
import type { AccessToken } from '@twurple/auth';
import type { HelixUser } from '@twurple/api';
import type { User, UserPreference } from '@prisma/client';

export type FullUser = User & { userPreferences: UserPreference | null };

/**
 * Prisma client instance
 *
 * @type {PrismaClient}
 */
export const prisma = new PrismaClient().$extends({
	model: {
		user: {
			/**
			 * Updates the database to set whether the
			 * bot joins the user's channel on startup.
			 *
			 * @async
			 * @param {string} userId Twitch ID of the user
			 * @param {boolean} botJoinsChannel Whether tho bot should join the channel
			 * @returns {void}
			 */
			async UpdateChannel(userId: string, botJoinsChannel: boolean) {
				return await prisma.userPreference.upsert({
					where: {
						userId: userId
					},
					update: {
						botJoinsChannel: botJoinsChannel
					},
					create: {
						user: {
							connect: {
								twitchID: userId
							}
						},
						botJoinsChannel: botJoinsChannel
					}
				});
			},

			/**
			 * Adds the given user to the list of channels for the bot
			 * to join on startup
			 *
			 * @async
			 * @param {string} userId Twitch ID of the user
			 * @returns {void}
			 */
			async AddChannel(userId: string) {
				return await this.UpdateChannel(userId, true);
			},

			/**
			 * Removes the given user from the list of channels for the bot
			 * to join on startup.
			 *
			 * @async
			 * @param {string} userId Twitch ID of the user
			 * @returns {unknown}
			 */
			async RemoveChannel(userId: string) {
				return await this.UpdateChannel(userId, false);
			},

			/**
			 * Gets the list of channels for the bot to join upon startup
			 *
			 * @async
			 * @returns {string[]} List of channel names
			 */
			async GetChannels() {
				try {
					const channels = (
						await prisma.user.findMany({
							where: {
								userPreferences: {
									botJoinsChannel: true
								}
							},
							select: {
								channelName: true
							}
						})
					)?.map(({ channelName }) => channelName!);

					return channels;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return [];
			},

			/**
			 * Inserts or updates the given user into the user database
			 *
			 * @async
			 * @param {HelixUser} twitch_user Twitch User
			 * @returns {User} Updated user
			 */
			async UpdateUser(twitch_user: HelixUser) {
				try {
					const user = await prisma.user.upsert({
						where: {
							twitchID: twitch_user.id
						},
						update: {},
						create: {
							channelName: twitch_user.name,
							displayName: twitch_user.displayName,
							twitchID: twitch_user.id,
							twitchProfilePictureURL: twitch_user.profilePictureUrl,
							userPreferences: {
								create: {
									botJoinsChannel: false,
									cardsPerRound: 6,
									draftRoundDuration: 90,
									subsExtraVote: false
								}
							}
						},
						include: {
							userPreferences: true
						}
					});

					return user;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return null;
			},

			/**
			 * Updates whether the user is authorized to use Oro Chat Draft
			 *
			 * @async
			 * @param {HelixUser} user Twitch User to authorize/deauthorize
			 * @param {boolean} isAuthorized User authorization status
			 * @returns {User} The updated user
			 */
			async UpdateUserAuthorization(user: HelixUser, isAuthorized: boolean) {
				try {
					const db_user = await prisma.user.upsert({
						where: {
							channelName: user.name
						},
						update: {
							isAuthorized: isAuthorized
						},
						create: {
							channelName: user.name,
							displayName: user.displayName,
							isAuthorized: isAuthorized,
							initialSetupDone: false,
							twitchID: user.id,
							twitchProfilePictureURL: user.profilePictureUrl,
							userPreferences: {
								create: {
									cardsPerRound: 6,
									draftRoundDuration: 90,
									subsExtraVote: false
								}
							}
						}
					});
					return db_user;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},

			/**
			 * Gets the list of authorized users of Oro Chat Draft.
			 *
			 * @async
			 * @returns {User[]} List of authorized users.
			 */
			async GetAuthorizedUsers() {
				try {
					const users = await prisma.user.findMany({
						where: {
							isAuthorized: true
						}
					});
					return users.map((user) => user.channelName);
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return undefined;
			},

			/**
			 * Gets the list of Admin users for Oro Chat Draft
			 *
			 * @async
			 * @returns {User[]} List of Admin users
			 */
			async GetAdminUsers() {
				try {
					const users = await prisma.user.findMany({
						where: {
							isAdmin: true
						}
					});

					return users.map((user) => user.channelName);
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return undefined;
			},

			/**
			 * Updates the status of whether the given user needs to complete
			 * Getting Started before they can start a draft.
			 *
			 * @async
			 * @param {string} username Twitch username
			 * @param {boolean} isComplete Whether to set their getting started to complete or not
			 * @returns {User} Updated user
			 */
			async UpdateUserSetupCompleteStatus(username: string, isComplete: boolean) {
				try {
					const user = await prisma.user.upsert({
						where: {
							channelName: username
						},
						update: {
							initialSetupDone: isComplete
						},
						create: {
							channelName: username,
							initialSetupDone: isComplete
						}
					});
					return user;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},

			/**
			 * Returns the list of users that have finished Getting Started setup
			 *
			 * @async
			 * @returns {User[]} The list of setup complete users
			 */
			async GetSetupCompleteUsers() {
				try {
					const users = await prisma.user.findMany({
						where: {
							initialSetupDone: true
						}
					});

					return users.map((user) => user.channelName);
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return undefined;
			},

			/**
			 * Resets the Setup Complete status of the given user
			 *
			 * @async
			 * @param {string} username Twitch username to reset
			 * @returns {User} Updated user
			 */
			async ResetSetupComplete(username: string) {
				try {
					const user = await prisma.user.update({
						where: {
							channelName: username
						},
						data: {
							initialSetupDone: false
						}
					});

					return user;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return undefined;
			},

			/**
			 * Gets all registered users of the Oro Chat Draft system
			 *
			 * @async
			 * @returns {User[]} All registered users
			 */
			async GetAllUsers() {
				try {
					return await prisma.user.findMany({
						include: {
							userPreferences: true
						}
					});
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}

				return undefined;
			}
		},
		token: {
			/**
			 * Saves the access token for the given user ID.
			 *
			 * @async
			 * @param {string} user_id Twitch User ID of the user token data is associated with
			 * @param {AccessToken} token_data AccessToken data
			 * @returns {*}
			 */
			async SaveToken(user_id: string, token_data: AccessToken) {
				try {
					await prisma.token.upsert({
						where: {
							twitchID: user_id
						},
						update: {
							token: JSON.stringify(token_data)
						},
						create: {
							twitchID: user_id,
							twitchChannelName: user_id,
							token: JSON.stringify(token_data)
						}
					});
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},

			/**
			 * Loads the access token for the given user
			 *
			 * @async
			 * @param {string} user_id Twitch User ID of the user to load token data for
			 * @returns {AccessToken} Twitch Access Token Data
			 */
			async LoadToken(user_id: string) {
				let data = null;
				try {
					data = await prisma.token.findUnique({ where: { twitchID: user_id } });
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
				if (data && data.token) {
					const tokenData = await JSON.parse(data.token);
					return tokenData as AccessToken;
				}
				return null;
			}
		},
		userPreference: {
			/**
			 * Updates or Creates the default draft preferences for the given user.
			 *
			 * @async
			 * @param {string} twitchId Twitch User ID of the user to update
			 * @param {number} duration Duration of each voting period
			 * @param {number} selectionCount Number of cards per selection pool
			 * @param {boolean} subsExtraVote Whether subscribers get +1 vote
			 * @returns {User} Updated user info.
			 */
			async UpdateUserPreferences(
				twitchId: string,
				duration: number,
				selectionCount: number,
				subsExtraVote: boolean
			) {
				try {
					const user = await prisma.userPreference.upsert({
						where: {
							userId: twitchId
						},
						update: {
							draftRoundDuration: duration,
							cardsPerRound: selectionCount,
							subsExtraVote: subsExtraVote
						},
						create: {
							draftRoundDuration: duration,
							cardsPerRound: selectionCount,
							subsExtraVote: subsExtraVote,
							user: {
								connect: {
									twitchID: twitchId
								}
							}
						}
					});
					return user;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},

			/**
			 * Updates or creates the User's Card Collection
			 *
			 * @async
			 * @param {string} twitchId Twitch User ID of the user to update
			 * @param {string[]} cards List of CardDefIds for the cards in the user's collection
			 * @returns {User} Updated user.
			 */
			async UpdateUserCollection(twitchId: string, cards: string[]) {
				try {
					const userPreference = await prisma.userPreference.upsert({
						where: {
							userId: twitchId
						},
						update: {
							collection: JSON.stringify(cards)
						},
						create: {
							collection: JSON.stringify(cards),
							user: {
								connect: {
									twitchID: twitchId
								}
							}
						}
					});
					return userPreference;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},

			/**
			 * Resets user collection. This means that Oro Chat Draft will treat
			 * them as collection complete.
			 *
			 * @async
			 * @param {string} twitchId Twitch User ID of the user to update
			 * @returns {User} Updated user.
			 */
			async ResetUserCollection(twitchId: string) {
				try {
					const userPreference = await prisma.userPreference.update({
						where: {
							userId: twitchId
						},
						data: {
							collection: null
						}
					});
					return userPreference;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},

			/**
			 * Get the collection info for the given user.
			 *
			 * @async
			 * @param {string} twitchId Twitch User ID of the user to get the collection of
			 * @returns {string[]} List of cards in the user's collection, or an empty array if collection complete.
			 */
			async GetUserCollection(twitchId: string) {
				try {
					const data = await prisma.userPreference.findFirst({
						where: {
							userId: twitchId
						},
						select: {
							collection: true
						}
					});

					if (data && data.collection) {
						return JSON.parse(data.collection) as string[];
					}
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
				return [];
			},

			/**
			 * Gets user preferences for the given user
			 *
			 * @async
			 * @param {string} twitchName Twitch Channel name for the user to query
			 * @returns {UserPreference}
			 */
			async GetUserPreference(twitchName: string) {
				try {
					return await prisma.userPreference.findFirst({
						where: {
							user: {
								channelName: twitchName
							}
						},
						select: {
							botJoinsChannel: true,
							cardsPerRound: true,
							collection: true,
							draftRoundDuration: true,
							snapFanApiKey: true,
							subsExtraVote: true,
							userId: true,
							bgOpacity: true
						}
					});
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
				return null;
			},

			/**
			 * Updates the user's preferred background opacity
			 *
			 * @async
			 * @param {string} twitchId Twitch User ID of the user to update
			 * @param {number} opacity The user's preferred background opacity
			 * @returns {User} Updated user
			 */
			async UpdateUserBgOpacity(twitchId: string, opacity: number) {
				try {
					const user = await prisma.userPreference.upsert({
						where: {
							userId: twitchId
						},
						update: {
							bgOpacity: opacity
						},
						create: {
							bgOpacity: opacity,
							user: {
								connect: {
									twitchID: twitchId
								}
							}
						}
					});
					return user;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			}
		},
		oneTimeDraftBatch: {
			/**
			 * Returns batch information about a one time batch for a given tag.
			 * @param tag The tag used to identify the batch
			 * @returns Batch information if any found
			 */
			async GetOneTimeBatch(tag: string) {
				try {
					return await prisma.oneTimeDraftBatch.findUnique({
						where: {
							tag: tag
						},
						include: {
							drafts: true
						}
					});
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},
			/**
			 * Create a batch of One Time Drafts with the given batch tag and expiration
			 * @param tag Batch tag used to identify this batch
			 * @param count Number of One Time Drafts to create
			 * @param expiration Expiration date of the OTD Links
			 * @returns The Draft batch including list of OTD draft IDs
			 */
			async CreateOneTimeDraftBatch(
				tag: string,
				count: number,
				expiration: Date,
				cardDefKeys: string
			) {
				try {
					return await prisma.oneTimeDraftBatch.create({
						data: {
							tag: tag,
							expiration: expiration,
							cardPool: cardDefKeys,
							drafts: {
								createMany: {
									data: [...Array(count).keys()].map(() => {
										return {
											id: undefined
										};
									})
								}
							}
						},
						include: {
							drafts: true
						}
					});
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			}
		},
		oneTimeDraft: {
			/**
			 * Starts a One Time Draft
			 * @param id ID of the One Time Draft
			 * @returns Updated draft
			 */
			async StartOneTimeDraft(id: string) {
				try {
					const draft = await prisma.oneTimeDraft.update({
						where: {
							id: id
						},
						data: {
							startedAt: new Date()
						}
					});
					return draft;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},
			/**
			 * Return a One Time Draft for given ID
			 * @param id ID of the Draft
			 * @returns
			 */
			async GetOneTimeDraft(id: string) {
				try {
					const draft = await prisma.oneTimeDraft.findUnique({
						where: {
							id: id
						},
						select: {
							batchId: true,
							cards: true,
							finishedAt: true,
							id: true,
							startedAt: true,
							batch: {
								select: {
									cardPool: true,
									expiration: true,
									tag: true
								}
							}
						}
					});
					return draft;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},
			/**
			 * Marks the given one time draft as finished.
			 * @param id ID of the One Time Draft
			 * @param cards Stringified array of cardDefIds of cards selected in draft
			 * @returns
			 */
			async FinishOneTimeDraft(id: string, cards: string) {
				try {
					const draft = prisma.oneTimeDraft.update({
						where: {
							id: id
						},
						data: {
							cards: cards,
							finishedAt: new Date()
						}
					});
					return draft;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			},
			/**
			 * End a One Time Draft early
			 * @param id The OTD to update
			 * @returns
			 */
			async CancelOneTimeDraft(id: string) {
				try {
					const draft = prisma.oneTimeDraft.update({
						where: {
							id: id
						},
						data: {
							finishedAt: new Date()
						}
					});
					return draft;
				} catch (error) {
					let message = 'Unknown Error';
					if (error instanceof Error) message = error.message;
					console.log(message);
				}
			}
		}
	}
});
