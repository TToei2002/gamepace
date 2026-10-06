const apiKey = process.env.STEAM_API_KEY || "YOUR_STEAM_API_KEY_HERE";

async function testPublicIds() {
  // Test vanity URL resolution
  const vanityUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=robinwalker`;
  const vanityRes = await fetch(vanityUrl);
  const vanityData = await vanityRes.json();
  console.log('Vanity RobinWalker:', vanityData);

  if (vanityData.response?.steamid) {
    const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${vanityData.response.steamid}&include_appinfo=1`;
    const gamesRes = await fetch(gamesUrl);
    const gamesData = await gamesRes.json();
    console.log('RobinWalker Games Count:', gamesData.response?.game_count);
    if (gamesData.response?.games) {
      console.log('Sample Game:', gamesData.response.games[0]);
    }
  }
}

testPublicIds();
