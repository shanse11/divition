import { describe, expect, it } from "vitest";
import {
  DEFAULT_AUDIO_PREFERENCES,
  normalizeAudioPreferences,
  preferencesFromStoredSettings,
} from "@/lib/audio/preferences";

describe("audio preference defaults", () => {
  it("starts muted at a moderate stored volume", () => {
    expect(DEFAULT_AUDIO_PREFERENCES).toEqual({
      enabled: false,
      volume: 0.5,
      reducedEffects: false,
    });
  });

  it("normalizes malformed persisted values without enabling sound", () => {
    expect(normalizeAudioPreferences({ enabled: "yes", volume: 9 })).toEqual(
      DEFAULT_AUDIO_PREFERENCES,
    );
    expect(
      normalizeAudioPreferences({
        enabled: true,
        volume: 0.25,
        reducedEffects: true,
      }),
    ).toEqual({ enabled: true, volume: 0.25, reducedEffects: true });
  });

  it("preserves enabled local settings when server settings are unavailable", () => {
    expect(
      preferencesFromStoredSettings({
        motionLevel: "full",
        musicEnabled: true,
        musicVolume: 25,
      }),
    ).toEqual({ enabled: true, volume: 0.25, reducedEffects: false });
  });
});
