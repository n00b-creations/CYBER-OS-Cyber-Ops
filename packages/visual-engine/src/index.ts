export interface VisualEffectOptions {
  intensity: 'off' | 'low' | 'medium' | 'high';
  reducedMotion: boolean;
}

export function resolveMotion(options: VisualEffectOptions): number {
  if (options.reducedMotion || options.intensity === 'off') return 0;
  return options.intensity === 'low' ? 0.35 : options.intensity === 'medium' ? 0.65 : 1;
}

export interface SceneController {
  mount(container: HTMLElement): void;
  setIntensity(value: VisualEffectOptions['intensity']): void;
  destroy(): void;
}
