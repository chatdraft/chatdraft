import type { PrismaClient } from "@prisma/client";
import type { HelixUser } from "@twurple/api";

export async function getAuthorizedUsers(prisma: PrismaClient) {
    const users = await prisma.user.findMany({
        where: {
            isAuthorized: true
        }
    })

    return users.map((user) => user.channelName)
}

export async function getAdminUsers(prisma: PrismaClient) {
    const users = await prisma.user.findMany({
        where: {
            isAdmin: true
        }
    })

    return users.map((user) => user.channelName)
}

export async function updateUser(prisma: PrismaClient, twitch_user: HelixUser) {
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

export async function updateUserAuthorization(prisma: PrismaClient, username: string, isAuthorized: boolean) {

    await prisma.user.upsert({
        where: {
            channelName: username,
        },
        update: {
            isAuthorized: isAuthorized
        },
        create: {
            channelName: username,
            isAuthorized: isAuthorized,
        }
    })
}

export async function updateUserSetupCompleteStatus(prisma: PrismaClient, username: string, isComplete: boolean) {
    await prisma.user.upsert({
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

}

export async function updateUserPreferences(prisma: PrismaClient, twitchId: string, duration: number, selectionCount: number, subsExtraVote: boolean) {
    await prisma.userPreference.upsert({
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
}