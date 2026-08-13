import React from 'react';
import { themes } from '../../../packages/theme-engine/src';
import { applyTheme } from '../theme';

export function ThemeSelector({ activeId, onChange }: { activeId: string; onChange?: (id: string) => void }) {
  return <select aria-label="Theme" value={activeId} onChange={(event) => { const id = event.target.value; applyTheme(id); onChange?.(id); }}><option value="">Select theme</option>{themes.map((theme) => <option value={theme.id} key={theme.id}>{theme.name}</option>)}</select>;
}
