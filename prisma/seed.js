const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial GamePace data...');

  // 1. Get or create user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        steamId: '76561198000000001',
        name: 'Steam Gamer Pro',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        weekdayCapHours: 2.0,
        weekendCapHours: 5.5,
      },
    });
  }

  console.log(`Target User ID: ${user.id} (${user.name})`);

  // 2. Initial popular games database
  const gamesData = [
    {
      steamAppId: 1091500,
      title: 'Cyberpunk 2077',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
      hltbMainStory: 25.0,
      hltbExtra: 60.0,
      hltbCompletionist: 104.0,
      status: 'PLAYING',
      playedMins: 2040, // 34h
    },
    {
      steamAppId: 1687950,
      title: 'Persona 5 Royal',
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80',
      hltbMainStory: 101.0,
      hltbExtra: 124.0,
      hltbCompletionist: 143.0,
      status: 'PLAYING',
      playedMins: 900, // 15h
    },
    {
      steamAppId: 1245620,
      title: 'Elden Ring',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
      hltbMainStory: 59.0,
      hltbExtra: 100.0,
      hltbCompletionist: 133.0,
      status: 'BACKLOG',
      playedMins: 0,
    },
    {
      steamAppId: 292030,
      title: 'The Witcher 3: Wild Hunt',
      coverUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=500&q=80',
      hltbMainStory: 52.0,
      hltbExtra: 103.0,
      hltbCompletionist: 173.0,
      status: 'BACKLOG',
      playedMins: 0,
    },
    {
      steamAppId: 883710,
      title: 'Resident Evil 2',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
      hltbMainStory: 9.0,
      hltbExtra: 15.0,
      hltbCompletionist: 36.0,
      status: 'COMPLETED',
      playedMins: 900, // 15h
    },
    {
      steamAppId: 1145360,
      title: 'Hades',
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80',
      hltbMainStory: 23.0,
      hltbExtra: 47.0,
      hltbCompletionist: 98.0,
      status: 'BACKLOG',
      playedMins: 150,
    },
  ];

  for (const g of gamesData) {
    const game = await prisma.game.upsert({
      where: { steamAppId: g.steamAppId },
      update: {
        title: g.title,
        coverUrl: g.coverUrl,
        hltbMainStory: g.hltbMainStory,
        hltbExtra: g.hltbExtra,
        hltbCompletionist: g.hltbCompletionist,
      },
      create: {
        steamAppId: g.steamAppId,
        title: g.title,
        coverUrl: g.coverUrl,
        hltbMainStory: g.hltbMainStory,
        hltbExtra: g.hltbExtra,
        hltbCompletionist: g.hltbCompletionist,
      },
    });

    const existingUserGame = await prisma.userGame.findFirst({
      where: { userId: user.id, gameId: game.id },
    });

    if (!existingUserGame) {
      await prisma.userGame.create({
        data: {
          userId: user.id,
          gameId: game.id,
          status: g.status,
          targetGoal: 'EXTRA',
          targetHours: g.hltbExtra,
          currentPlayedMinutes: g.playedMins,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
