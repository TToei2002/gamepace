const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const games = await prisma.game.findMany();
  const userGames = await prisma.userGame.findMany({
    include: { game: true, user: true },
  });

  console.log('--- USER PROFILE ---');
  console.table(users.map(u => ({ id: u.id, name: u.name, steamId: u.steamId, weekdayCap: u.weekdayCapHours, weekendCap: u.weekendCapHours })));

  console.log('\n--- GAMES IN DATABASE ---');
  console.table(games.map(g => ({ appId: g.steamAppId, title: g.title, HLTB_Main: g.hltbMainStory, HLTB_Extra: g.hltbExtra, HLTB_100: g.hltbCompletionist })));

  console.log('\n--- USER BACKLOG & KANBAN STATE ---');
  console.table(userGames.map(ug => ({
    id: ug.id,
    title: ug.game.title,
    status: ug.status,
    targetHours: ug.targetHours,
    playedMins: ug.currentPlayedMinutes,
    playedHours: (ug.currentPlayedMinutes / 60).toFixed(1),
  })));
}

main().finally(() => prisma.$disconnect());
