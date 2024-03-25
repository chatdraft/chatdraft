import type { PrismaClient } from "@prisma/client";

export async function AddChannel(prisma: PrismaClient, userId: string) {
    return await UpdateChannel(prisma, userId, true);
}

export async function RemoveChannel(prisma: PrismaClient, userId: string) {
    return await UpdateChannel(prisma, userId, false);
}

export async function GetChannels(prisma: PrismaClient) {
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
}

async function UpdateChannel(prisma: PrismaClient, userId: string, botJoinsChannel: boolean) {
    try {
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
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        console.log(message);
    }

    return undefined;
}