"use client";

import { useEffect } from "react";

export interface StoredPreferences {
  motionLevel: "full" | "reduced";
  musicEnabled: boolean;
  musicVolume: number;
}

export const PREFERENCES_KEY = "astral.preferences";

export function applyPreferences(preferences: StoredPreferences) {
  document.documentElement.dataset.motion = preferences.motionLevel;
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  window.dispatchEvent(
    new CustomEvent("astral:audio-preferences", {
      detail: {
        enabled: preferences.musicEnabled,
        volume: preferences.musicVolume / 100,
        reducedEffects: preferences.motionLevel === "reduced",
      },
    }),
  );
}

export function PreferenceApplicator({
  preferences,
}: {
  preferences: StoredPreferences | null;
}) {
  useEffect(() => {
    if (preferences) {
      applyPreferences(preferences);
      return;
    }
    try {
      const stored = JSON.parse(
        localStorage.getItem(PREFERENCES_KEY) ?? "null",
      ) as StoredPreferences | null;
      if (stored) applyPreferences(stored);
    } catch {
      localStorage.removeItem(PREFERENCES_KEY);
    }
  }, [preferences]);
  return null;
}
