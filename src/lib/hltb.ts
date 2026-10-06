export interface HLTBResult {
  title: string;
  mainStory: number;
  mainExtra: number;
  completionist: number;
}

const HLTB_MOCK_DATABASE: Record<string, HLTBResult> = {
  'cyberpunk 2077': { title: 'Cyberpunk 2077', mainStory: 25.0, mainExtra: 60.0, completionist: 104.0 },
  'persona 5 royal': { title: 'Persona 5 Royal', mainStory: 101.0, mainExtra: 124.0, completionist: 143.0 },
  'elden ring': { title: 'Elden Ring', mainStory: 59.0, mainExtra: 100.0, completionist: 133.0 },
  'the witcher 3: wild hunt': { title: 'The Witcher 3: Wild Hunt', mainStory: 52.0, mainExtra: 103.0, completionist: 173.0 },
  'resident evil 2': { title: 'Resident Evil 2', mainStory: 9.0, mainExtra: 15.0, completionist: 36.0 },
  'hades': { title: 'Hades', mainStory: 23.0, mainExtra: 47.0, completionist: 98.0 },
  "baldur's gate 3": { title: "Baldur's Gate 3", mainStory: 68.0, mainExtra: 105.0, completionist: 155.0 },
  'stardew valley': { title: 'Stardew Valley', mainStory: 53.0, mainExtra: 94.0, completionist: 148.0 },
  'god of war': { title: 'God of War', mainStory: 20.5, mainExtra: 32.5, completionist: 51.0 },
  'hollow knight': { title: 'Hollow Knight', mainStory: 27.0, mainExtra: 41.5, completionist: 63.0 },
};

export async function lookupHLTB(title: string): Promise<HLTBResult> {
  const normalized = title.trim().toLowerCase();

  for (const key of Object.keys(HLTB_MOCK_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return HLTB_MOCK_DATABASE[key];
    }
  }

  // Generic estimate fallback algorithm based on title length
  const defaultBase = Math.max(12, Math.floor(title.length * 2.5));
  return {
    title,
    mainStory: defaultBase,
    mainExtra: Math.round(defaultBase * 1.8),
    completionist: Math.round(defaultBase * 2.6),
  };
}
