import { PrismaClient } from '@prisma/client'
import type { AccessToken } from '@twurple/auth';
import type { HelixUser } from '@twurple/api';

export type User = ({ userPreferences: { id: string; userId: string; draftRoundDuration: number; cardsPerRound: number; subsExtraVote: boolean; botJoinsChannel: boolean; snapFanApiKey: string | null; collection: string | null; bgOpacity: number; } | null; } & { id: string; channelName: string; displayName: string | null; isAdmin: boolean; isAuthorized: boolean; twitchID: string | null; twitchProfilePictureURL: string | null; initialSetupDone: boolean; createdAt: Date; } | null)

export const prisma = new PrismaClient().$extends({
    model: {
        user: {
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
                })
            },

            async AddChannel(userId: string) {
                return await this.UpdateChannel(userId, true)
            },

            async RemoveChannel(userId: string) {
                return await this.UpdateChannel(userId, false)
            },

            async GetChannels() {
                try {
                    const channels = (await prisma.user.findMany({
                       where: {
                           userPreferences: {
                               botJoinsChannel: true
                           }
                       },
                       select: {
                           channelName: true
                       }
                   }))?.map(({channelName}) => channelName!);
           
                   return channels
               }
               catch (error) {
                   let message = 'Unknown Error';
                   if (error instanceof Error) message = error.message;
                   console.log(message);
               }
           
               return [];
            },

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
                            },
                        },
                        include: {
                            userPreferences: true
                        }
                    });
            
                    return user;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            
                return null
            },

            async UpdateUserAuthorization(user: HelixUser, isAuthorized: boolean) {
                try {
                    const db_user = await prisma.user.upsert({
                        where: {
                            channelName: user.name,
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
                                    subsExtraVote: false,
                                }
                            }
                        }
                    })
                    return db_user;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            },

            async GetAuthorizedUsers() {
                try {
                    const users = await prisma.user.findMany({
                        where: {
                            isAuthorized: true
                        }
                    })
                    return users.map((user) => user.channelName);
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            
                return undefined;
            },
            
            async GetAdminUsers() {
                try {
                    const users = await prisma.user.findMany({
                        where: {
                            isAdmin: true
                        }
                    })
            
                    return users.map((user) => user.channelName)
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            
                return undefined;
            },

            async UpdateUserSetupCompleteStatus(username: string, isComplete: boolean) {
                try {
                    const user = await prisma.user.upsert({
                        where: {
                            channelName: username,
                        },
                        update: {
                            initialSetupDone: isComplete
                        },
                        create: {
                            channelName: username,
                            initialSetupDone: isComplete,
                        }
                    })
                    return user;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            },

            async GetSetupCompleteUsers() {
                try {
                    const users = await prisma.user.findMany({
                        where: {
                            initialSetupDone: true
                        }
                    });
            
                    return users.map((user) => user.channelName)
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            
                return undefined;
            },

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
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            
                return undefined;
            },
        },
        token: {
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
                            token: JSON.stringify(token_data),
                        }
                    })
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            },

            async LoadToken(user_id: string) {
                let data = null;
                try {
                    data = await prisma.token.findUnique({where: {twitchID: user_id}})
                }
                catch (error) {
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
            async UpdateUserPreferences(twitchId: string, duration: number, selectionCount: number, subsExtraVote: boolean) {
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
                    })
                    return user;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            },

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
                    })
                    return userPreference;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            },

            async ResetUserCollection(twitchId: string) {
                try {
                    const userPreference = await prisma.userPreference.update({
                        where: {
                            userId: twitchId,
                        },
                        data: {
                            collection: null,
                        }
                    })
                    return userPreference;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            },

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
                        return JSON.parse(data.collection) as string[]
                    }
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
                return [];
            },

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
                    })
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
                return null;
            },

            async UpdateUserBgOpacity(twitchId: string, opacity: number) {
                try {
                    const user = await prisma.userPreference.upsert({
                        where: {
                            userId: twitchId
                        },
                        update: {
                            bgOpacity: opacity,
                        },
                        create: {
                            bgOpacity: opacity,
                            user: {
                                connect: {
                                    twitchID: twitchId
                                }
                            }
                        }
                    })
                    return user;
                }
                catch (error) {
                    let message = 'Unknown Error';
                    if (error instanceof Error) message = error.message;
                    console.log(message);
                }
            }
        }
    }
})
