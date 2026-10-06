export type ThemeMode = 'light-blue' | 'dark-purple';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  badge: string;
  bg: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  'light-blue': {
    id: 'light-blue',
    name: 'Light',
    badge: 'Light',
    bg: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    border: '#cbd5e1',
    text: '#0f172a',
    muted: '#64748b',
    primary: '#0284c7',
    accent: '#2563eb',
  },
  'dark-purple': {
    id: 'dark-purple',
    name: 'Dark',
    badge: 'Dark',
    bg: '#090514',
    surface: '#130c25',
    card: '#1c1335',
    border: '#2e1f54',
    text: '#f3e8ff',
    muted: '#94a3b8',
    primary: '#9333ea',
    accent: '#c084fc',
  },
};
