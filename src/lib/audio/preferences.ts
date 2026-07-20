export interface AudioPreferences {
  enabled: boolean;
  volume: number;
  reducedEffects: boolean;
}

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = Object.freeze({
  enabled: false,
  volume: 0.5,
  reducedEffects: false,
});

export interface StoredAudioSettings {
  motionLevel: "full" | "reduced";
  musicEnabled: boolean;
  musicVolume: number;
}

export function preferencesFromStoredSettings(
  settings: StoredAudioSettings,
): AudioPreferences {
  return normalizeAudioPreferences({
    enabled: settings.musicEnabled,
    volume: settings.musicVolume / 100,
    reducedEffects: settings.motionLevel === "reduced",
  });
}

export function normalizeAudioPreferences(value: unknown): AudioPreferences {
  if (!value || typeof value !== "object")
    return { ...DEFAULT_AUDIO_PREFERENCES };
  const candidate = value as Partial<AudioPreferences>;
  if (
    typeof candidate.enabled !== "boolean" ||
    typeof candidate.volume !== "number" ||
    !Number.isFinite(candidate.volume) ||
    candidate.volume < 0 ||
    candidate.volume > 1
  ) {
    return { ...DEFAULT_AUDIO_PREFERENCES };
  }
  return {
    enabled: candidate.enabled,
    volume: candidate.volume,
    reducedEffects:
      typeof candidate.reducedEffects === "boolean"
        ? candidate.reducedEffects
        : false,
  };
}
