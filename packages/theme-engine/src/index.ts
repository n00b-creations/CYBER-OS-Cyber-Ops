export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  info: string;
  success: string;
  warning: string;
  danger: string;
  critical: string;
}

export interface ThemeDefinition { id: string; name: string; tokens: ThemeTokens; }

export const themes: ThemeDefinition[] = [
  { id: 'cyber-dark', name: 'Cyber Dark', tokens: { background:'#070a0f', surface:'#0d151b', surfaceRaised:'#102027', border:'#29414b', text:'#dbe7ef', textMuted:'#708a95', accent:'#6ee7b7', info:'#7dd3fc', success:'#6ee7b7', warning:'#fbbf24', danger:'#fb7185', critical:'#f43f5e' } },
  { id: 'cyber-light', name: 'Cyber Light', tokens: { background:'#eef3f6', surface:'#ffffff', surfaceRaised:'#f4f7f9', border:'#cbd5dc', text:'#16232b', textMuted:'#5f737d', accent:'#147d63', info:'#0369a1', success:'#147d63', warning:'#a16207', danger:'#be123c', critical:'#9f1239' } },
];

export function getTheme(id: string): ThemeDefinition {
  return themes.find((theme) => theme.id === id) ?? themes[0];
}
