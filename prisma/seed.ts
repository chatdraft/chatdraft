import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oro = await prisma.user.upsert({
    where: {
      twitchID: '50721467',
    },
    update: {},
    create: {
      channelName: 'ssbmoro',
      displayName: 'ssbmOro',
      twitchID: '50721467',
      isAdmin: true,
      initialSetupDone: true,
      isAuthorized: true,
      twitchProfilePictureURL:
        'https://static-cdn.jtvnw.net/jtv_user_pictures/bc432a12-327d-406b-b49e-a88d500a89f1-profile_image-300x300.png',
    },
  });

  const jjrolk = await prisma.user.upsert({
    where: {
      twitchID: '30549049',
    },
    update: {},
    create: {
      channelName: 'jjrolk',
      displayName: 'jjrolk',
      twitchID: '30549049',
      isAdmin: true,
      initialSetupDone: false,
      isAuthorized: true,
      twitchProfilePictureURL:
        'https://static-cdn.jtvnw.net/jtv_user_pictures/62390893-9bb5-4100-9f23-7ca7a271440c-profile_image-300x300.png',
    },
  });

  console.log({ oro, jjrolk });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
