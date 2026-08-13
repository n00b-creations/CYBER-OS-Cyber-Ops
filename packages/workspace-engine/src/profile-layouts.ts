import type { WorkspaceProfile } from '../../shared/src/domain';

export interface ProfileLayoutPreset { profile: WorkspaceProfile; layoutId: string; monitorLayoutId?: string; themeId?: string; }

export const profileLayoutPresets: ProfileLayoutPreset[] = [
  { profile: 'red', layoutId: 'red-mission', monitorLayoutId: 'single-primary', themeId: 'cyber-dark' },
  { profile: 'blue', layoutId: 'blue-soc', monitorLayoutId: 'soc-dual', themeId: 'cyber-dark' },
  { profile: 'purple', layoutId: 'purple-validation', monitorLayoutId: 'dual-analysis', themeId: 'cyber-dark' },
  { profile: 'dfir', layoutId: 'dfir-investigation', monitorLayoutId: 'forensics-dual', themeId: 'cyber-dark' },
  { profile: 'devsecops', layoutId: 'devsecops-pipeline', monitorLayoutId: 'single-primary', themeId: 'cyber-light' },
  { profile: 'threat-intel', layoutId: 'intel-correlation', monitorLayoutId: 'dual-analysis', themeId: 'cyber-dark' },
  { profile: 'noc', layoutId: 'noc-fleet', monitorLayoutId: 'noc-triple', themeId: 'cyber-dark' },
  { profile: 'executive', layoutId: 'executive-overview', monitorLayoutId: 'single-primary', themeId: 'cyber-light' },
  { profile: 'ai-ops', layoutId: 'ai-workflows', monitorLayoutId: 'dual-analysis', themeId: 'cyber-dark' },
];

export function getProfileLayout(profile: WorkspaceProfile): ProfileLayoutPreset | undefined {
  return profileLayoutPresets.find((preset) => preset.profile === profile);
}
