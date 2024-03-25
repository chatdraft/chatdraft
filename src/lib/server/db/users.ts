import type { PrismaClient } from "@prisma/client";
import type { HelixUser } from "@twurple/api";

export type User = ({ userPreferences: { id: string; userId: string; draftRoundDuration: number; cardsPerRound: number; subsExtraVote: boolean; botJoinsChannel: boolean; snapFanApiKey: string | null; collection: string | null; } | null; } & { id: string; channelName: string; displayName: string | null; isAdmin: boolean; isAuthorized: boolean; twitchID: string | null; twitchProfilePictureURL: string | null; initialSetupDone: boolean; createdAt: Date; } | null)

export async function getAuthorizedUsers(prisma: PrismaClient) {
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
}

export async function getAdminUsers(prisma: PrismaClient) {
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
}

export async function updateUser(prisma: PrismaClient, twitch_user: HelixUser) {
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
}

export async function updateUserAuthorization(prisma: PrismaClient, user: HelixUser, isAuthorized: boolean) {
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
}

export async function updateUserSetupCompleteStatus(prisma: PrismaClient, username: string, isComplete: boolean) {
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
}

export async function updateUserPreferences(prisma: PrismaClient, twitchId: string, duration: number, selectionCount: number, subsExtraVote: boolean) {
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
}

export async function updateUserCollection(prisma: PrismaClient, twitchId: string, cards: string[]) {
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
}

export async function resetUserCollection(prisma: PrismaClient, twitchId: string) {
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
}

export async function getUserCollection(prisma: PrismaClient, twitchId: string) {
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
}

export async function getUserPreferences(prisma: PrismaClient, twitchName: string) {
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
                userId: true
            }
        })
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.log(message);
    }
    return null;
}