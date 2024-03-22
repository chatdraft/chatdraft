import type { PrismaClient } from "@prisma/client";

export async function AddChannel(prisma: PrismaClient, userId: string) {
    UpdateChannel(prisma, userId, true);
}

export async function RemoveChannel(prisma: PrismaClient, userId: string) {
    UpdateChannel(prisma, userId, false);
}

export async function GetChannels(prisma: PrismaClient) {
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

    return channels;
}

async function UpdateChannel(prisma: PrismaClient, userId: string, botJoinsChannel: boolean) {
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
}