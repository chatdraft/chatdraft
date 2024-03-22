
import type { AccessToken } from '@twurple/auth';
import type { PrismaClient } from "@prisma/client";

export async function saveToken(prisma: PrismaClient, user_id: string, token_data: AccessToken) {
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

export async function loadToken(prisma: PrismaClient, user_id: string) {
    const data = await prisma.token.findUnique({where: {twitchID: user_id}})
    if (data && data.token) {
        const tokenData = await JSON.parse(data.token);
        return tokenData as AccessToken;
    }
    return null;
}