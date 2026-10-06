require('dotenv').config();
const { fetchSteamOwnedGames } = require('./src/lib/steam');

async function test() {
  console.log('STEAM_API_KEY from .env:', process.env.STEAM_API_KEY ? `${process.env.STEAM_API_KEY.slice(0, 5)}...` : 'EMPTY');
  
  const games = await fetchSteamOwnedGames('76561198000000001');
  console.log('Games count returned:', games.length);
  console.log('Sample games titles:', games.slice(0, 3).map(g => g.title));
}

test();
