import type { AccessToken } from '@twurple/auth';
import type { PrismaClient } from '@prisma/client';

export async function saveToken(
  prisma: PrismaClient,
  user_id: string,
  token_data: AccessToken
) {
  try {
    await prisma.token.upsert({
      where: {
        twitchID: user_id,
      },
      update: {
        token: JSON.stringify(token_data),
      },
      create: {
        twitchID: user_id,
        twitchChannelName: user_id,
        token: JSON.stringify(token_data),
      },
    });
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    console.log(message);
  }
}

export async function loadToken(prisma: PrismaClient, user_id: string) {
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
