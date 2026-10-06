export interface SteamGameItem {
  appId: number;
  title: string;
  coverUrl: string;
  playedMinutes: number;
  rtimeLastPlayed?: number;
}

export const MOCK_STEAM_LIBRARY: SteamGameItem[] = [
  {
    appId: 1091500,
    title: 'Cyberpunk 2077',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
    playedMinutes: 2040,
  },
  {
    appId: 1687950,
    title: 'Persona 5 Royal',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80',
    playedMinutes: 900,
  },
  {
    appId: 1245620,
    title: 'Elden Ring',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
    playedMinutes: 3600,
  },
  {
    appId: 292030,
    title: 'The Witcher 3: Wild Hunt',
    coverUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=500&q=80',
    playedMinutes: 0,
  },
  {
    appId: 883710,
    title: 'Resident Evil 2',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
    playedMinutes: 900,
  },
  {
    appId: 1145360,
    title: 'Hades',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80',
    playedMinutes: 150,
  },
  {
    appId: 1086940,
    title: "Baldur's Gate 3",
    coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&q=80',
    playedMinutes: 720,
  },
  {
    appId: 1172470,
    title: 'Apex Legends',
    coverUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=500&q=80',
    playedMinutes: 4800,
  },
  {
    appId: 413150,
    title: 'Stardew Valley',
    coverUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80',
    playedMinutes: 1800,
  },
].sort((a: SteamGameItem, b: SteamGameItem) => b.playedMinutes - a.playedMinutes);

export async function resolveSteamId(input: string): Promise<{ steamId: string; name: string; avatar: string }> {
  const cleanInput = input.trim();
  if (!cleanInput) {
    throw new Error('กรุณากรอก Steam ID หรือ Custom Profile URL');
  }

  let steamId64 = cleanInput;
  let vanityName = '';

  if (cleanInput.includes('steamcommunity.com/profiles/')) {
    const parts = cleanInput.split('steamcommunity.com/profiles/');
    steamId64 = parts[1].replace(/\//g, '').split('?')[0];
  } else if (cleanInput.includes('steamcommunity.com/id/')) {
    const parts = cleanInput.split('steamcommunity.com/id/');
    vanityName = parts[1].replace(/\//g, '').split('?')[0];
  } else if (!/^\d{17}$/.test(cleanInput)) {
    vanityName = cleanInput;
  }

  const apiKey = process.env.STEAM_API_KEY;

  if (vanityName) {
    if (!apiKey) {
      throw new Error('ไม่พบ STEAM_API_KEY ในระบบสำหรับตรวจสอบ Custom URL');
    }
    try {
      const res = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodeURIComponent(vanityName)}`
      );
      const data = await res.json();
      if (data.response?.success === 1 && data.response.steamid) {
        steamId64 = data.response.steamid;
      } else {
        throw new Error(`ไม่พบบัญชี Steam ที่ตรงกับชื่อ "${vanityName}" กรุณาตรวจสอบว่าสะกดถูกต้อง`);
      }
    } catch (e: any) {
      if (e.message && e.message.includes('ไม่พบบัญชี Steam')) {
        throw e;
      }
      console.warn('Failed to resolve vanity URL via Steam API:', e);
      throw new Error(`ไม่สามารถค้นหา Custom Profile "${vanityName}" ได้`);
    }
  }

  if (!/^\d{17}$/.test(steamId64)) {
    throw new Error('Steam ID ไม่ถูกต้อง (ต้องเป็นตัวเลข 17 หลัก เช่น 76561198... หรือใส่ Custom Profile URL)');
  }

  // Validate that this Steam ID actually exists on Steam
  if (apiKey) {
    try {
      const sumRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId64}`
      );
      const sumData = await sumRes.json();
      const player = sumData.response?.players?.[0];

      if (!player) {
        throw new Error(`ไม่พบบัญชี Steam ID: ${steamId64} บนระบบ Steam`);
      }

      return {
        steamId: steamId64,
        name: player.personaname || `SteamGamer_${steamId64.slice(-4)}`,
        avatar: player.avatarfull || player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      };
    } catch (e: any) {
      if (e.message && e.message.includes('ไม่พบบัญชี Steam')) {
        throw e;
      }
      console.warn('Failed to fetch player summary in resolveSteamId:', e);
    }
  }

  return {
    steamId: steamId64,
    name: `SteamGamer_${steamId64.slice(-4)}`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
  };
}

export interface FetchOwnedGamesResult {
  games: SteamGameItem[];
  isLive: boolean;
  message?: string;
}

export async function fetchSteamOwnedGames(steamId?: string): Promise<FetchOwnedGamesResult> {
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamId || !/^\d{17}$/.test(steamId)) {
    return {
      games: [],
      isLive: false,
      message: 'ยังไม่ได้ระบุ Steam ID หรือรูปแบบ Steam ID ไม่ถูกต้อง',
    };
  }

  if (!apiKey) {
    return {
      games: [],
      isLive: false,
      message: 'ยังไม่ได้กำหนดค่า STEAM_API_KEY ในระบบ',
    };
  }

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.response?.games && Array.isArray(data.response.games) && data.response.games.length > 0) {
      // เรียงหาเกมที่เพิ่งเล่นล่าสุดจริงๆ 5 อันดับแรก (Most Recently Played)
      const mostRecentlyPlayed = [...data.response.games]
        .filter((g: any) => (g.rtime_last_played || 0) > 0)
        .sort((a: any, b: any) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0))
        .slice(0, 5);

      console.log('🎮 [Steam 5 เกมที่คุณเพิ่งเล่นล่าสุดจริงๆ]:', mostRecentlyPlayed.map((g: any) => ({
        appid: g.appid,
        name: g.name,
        playtime_forever_hours: (g.playtime_forever / 60).toFixed(1) + ' ชม.',
        rtime_last_played: g.rtime_last_played,
        last_played: new Date(g.rtime_last_played * 1000).toLocaleString('th-TH'),
      })));

      const liveGames: SteamGameItem[] = data.response.games
        .map((g: any) => ({
          appId: g.appid,
          title: g.name || `App ${g.appid}`,
          coverUrl: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
          playedMinutes: g.playtime_forever || 0,
          rtimeLastPlayed: g.rtime_last_played || 0,
        }))
        .sort((a: SteamGameItem, b: SteamGameItem) => b.playedMinutes - a.playedMinutes);

      return {
        games: liveGames,
        isLive: true,
        message: `ดึงข้อมูลสำเร็จ! พบ ${liveGames.length} เกมในคลัง Steam ของคุณ`,
      };
    } else {
      return {
        games: [],
        isLive: false,
        message: 'ไม่พบเกมในคลัง Steam (อาจเป็นเพราะตั้งค่า Game Details เป็นส่วนตัว (Private) หรือยังไม่มีเกมในคลัง)',
      };
    }
  } catch (err: any) {
    console.warn('Steam API fetch failed:', err);
    return {
      games: [],
      isLive: false,
      message: 'ไม่สามารถเชื่อมต่อกับ Steam API ได้ในขณะนี้',
    };
  }
}

export interface PlayerSummaryResult {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  personaState: number;
  isPlaying: boolean;
  currentGameAppId: number | null;
  currentGameTitle: string | null;
  currentGameCoverUrl?: string | null;
  raw?: any;
}

export async function fetchPlayerSummary(steamId?: string | null): Promise<PlayerSummaryResult | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey || !steamId) return null;

  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
    const res = await fetch(url);
    const data = await res.json();
    const player = data.response?.players?.[0];
    if (!player) return null;

    const appId = player.gameid ? Number(player.gameid) : null;
    const coverUrl = appId
      ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`
      : null;

    return {
      steamId: player.steamid,
      personaName: player.personaname,
      avatarUrl: player.avatarfull || player.avatar,
      personaState: player.personastate,
      isPlaying: Boolean(player.gameextrainfo || player.gameid),
      currentGameAppId: appId,
      currentGameTitle: player.gameextrainfo || null,
      currentGameCoverUrl: coverUrl,
      raw: player,
    };
  } catch (err) {
    console.warn('Failed to fetch Steam player summary:', err);
    return null;
  }
}
