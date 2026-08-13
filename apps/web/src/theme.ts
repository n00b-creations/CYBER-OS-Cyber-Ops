import { getTheme, type ThemeDefinition } from '../../../packages/theme-engine/src';

export function applyTheme(themeId: string): ThemeDefinition {
  const theme = getTheme(themeId);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(`--cyber-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, value);
  }
  root.dataset.theme = theme.id;
  return theme;
}
