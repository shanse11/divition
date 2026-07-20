"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music2, Volume2, VolumeX } from "lucide-react";
import {
  DEFAULT_AUDIO_PREFERENCES,
  preferencesFromStoredSettings,
} from "@/lib/audio/preferences";

export type SoundCue = "button" | "shuffle" | "pick" | "flip" | "success";

const PREFERENCES_KEY = "astral.preferences";

export function playSound(cue: SoundCue) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("astral:sound", { detail: { cue } }));
}

interface AudioPreferenceDetail {
  enabled: boolean;
  volume: number;
  reducedEffects?: boolean;
}

type WebkitWindow = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export function MusicController({
  initialEnabled = DEFAULT_AUDIO_PREFERENCES.enabled,
  initialVolume = DEFAULT_AUDIO_PREFERENCES.volume,
  initialReducedEffects = DEFAULT_AUDIO_PREFERENCES.reducedEffects,
}: {
  initialEnabled?: boolean;
  initialVolume?: number;
  initialReducedEffects?: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [volume, setVolume] = useState(initialVolume);
  const [available, setAvailable] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<{
    nodes: AudioNode[];
    sources: AudioScheduledSourceNode[];
  } | null>(null);
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);
  const reducedRef = useRef(initialReducedEffects);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(PREFERENCES_KEY) ?? "null",
      ) as {
        motionLevel: "full" | "reduced";
        musicEnabled: boolean;
        musicVolume: number;
      } | null;
      if (!stored) return;
      const local = preferencesFromStoredSettings(stored);
      enabledRef.current = local.enabled;
      volumeRef.current = local.volume;
      reducedRef.current = local.reducedEffects;
      const sync = window.setTimeout(() => {
        setEnabled(local.enabled);
        setVolume(local.volume);
      }, 0);
      return () => window.clearTimeout(sync);
    } catch {
      // Invalid local preferences are ignored in favor of safe server defaults.
    }
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    volumeRef.current = volume;
    masterRef.current?.gain.setTargetAtTime(
      volume,
      contextRef.current?.currentTime ?? 0,
      0.04,
    );
  }, [volume]);

  const stopAmbient = useCallback(() => {
    ambientRef.current?.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // A source can already be stopped during page teardown.
      }
    });
    ambientRef.current?.nodes.forEach((node) => node.disconnect());
    ambientRef.current = null;
  }, []);

  const startAmbient = useCallback(
    (context: AudioContext, master: GainNode) => {
      if (ambientRef.current) return;
      const bed = context.createGain();
      bed.gain.value = reducedRef.current ? 0.018 : 0.03;
      bed.connect(master);

      const oscillators = [110, 164.81].map((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.value = index ? 0.1 : 0.07;
        oscillator.connect(gain).connect(bed);
        oscillator.start();
        return { oscillator, gain };
      });

      // Self-authored filtered noise provides a subtle ambient texture; no audio asset is loaded.
      const buffer = context.createBuffer(
        1,
        context.sampleRate * 2,
        context.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * 0.12;
      }
      const noise = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const noiseGain = context.createGain();
      noise.buffer = buffer;
      noise.loop = true;
      filter.type = "lowpass";
      filter.frequency.value = 420;
      noiseGain.gain.value = reducedRef.current ? 0.025 : 0.05;
      noise.connect(filter).connect(noiseGain).connect(bed);
      noise.start();

      ambientRef.current = {
        sources: [...oscillators.map(({ oscillator }) => oscillator), noise],
        nodes: [
          bed,
          filter,
          noiseGain,
          ...oscillators.flatMap(({ oscillator, gain }) => [oscillator, gain]),
          noise,
        ],
      };
    },
    [],
  );

  const ensureContext = useCallback(async () => {
    if (contextRef.current) {
      if (contextRef.current.state === "suspended")
        await contextRef.current.resume();
      return contextRef.current;
    }
    const AudioContextClass =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AudioContextClass) {
      setAvailable(false);
      return null;
    }
    try {
      const context = new AudioContextClass();
      const master = context.createGain();
      master.gain.value = volumeRef.current;
      master.connect(context.destination);
      contextRef.current = context;
      masterRef.current = master;
      await context.resume();
      setUnlocked(true);
      return context;
    } catch {
      setAvailable(false);
      return null;
    }
  }, []);

  const soundCue = useCallback(async (cue: SoundCue) => {
    if (!enabledRef.current || !masterRef.current) return;
    const context = contextRef.current;
    if (!context || context.state !== "running") return;
    const config: Record<SoundCue, [number, number, OscillatorType]> = {
      button: [420, 0.08, "sine"],
      shuffle: [150, 0.22, "triangle"],
      pick: [520, 0.1, "sine"],
      flip: [720, 0.16, "sine"],
      success: [880, 0.3, "sine"],
    };
    const [frequency, baseDuration, type] = config[cue];
    const duration = reducedRef.current ? baseDuration * 0.5 : baseDuration;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * (cue === "shuffle" ? 1.4 : 1.08),
      context.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      reducedRef.current ? 0.025 : 0.055,
      context.currentTime + 0.012,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration,
    );
    oscillator.connect(gain).connect(masterRef.current);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      gain.disconnect();
    });
  }, []);

  const persist = useCallback((nextEnabled: boolean, nextVolume: number) => {
    try {
      const current = JSON.parse(
        localStorage.getItem(PREFERENCES_KEY) ?? "{}",
      ) as Record<string, unknown>;
      localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({
          ...current,
          motionLevel: current.motionLevel === "reduced" ? "reduced" : "full",
          musicEnabled: nextEnabled,
          musicVolume: Math.round(nextVolume * 100),
        }),
      );
    } catch {
      // Storage may be unavailable in private browsing; audio still works for this session.
    }
    void fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        musicEnabled: nextEnabled,
        musicVolume: Math.round(nextVolume * 100),
      }),
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const preferenceListener = (event: Event) => {
      const detail = (event as CustomEvent<AudioPreferenceDetail>).detail;
      if (!detail || typeof detail.enabled !== "boolean") return;
      const nextVolume = Math.min(1, Math.max(0, detail.volume));
      enabledRef.current = detail.enabled;
      volumeRef.current = nextVolume;
      reducedRef.current = Boolean(detail.reducedEffects);
      setEnabled(detail.enabled);
      setVolume(nextVolume);
      if (!detail.enabled) stopAmbient();
      else if (contextRef.current && masterRef.current && unlocked) {
        startAmbient(contextRef.current, masterRef.current);
      }
    };
    const soundListener = (event: Event) => {
      const cue = (event as CustomEvent<{ cue?: SoundCue }>).detail?.cue;
      if (cue) void soundCue(cue);
    };
    window.addEventListener("astral:audio-preferences", preferenceListener);
    window.addEventListener("astral:sound", soundListener);
    return () => {
      window.removeEventListener(
        "astral:audio-preferences",
        preferenceListener,
      );
      window.removeEventListener("astral:sound", soundListener);
    };
  }, [soundCue, startAmbient, stopAmbient, unlocked]);

  useEffect(
    () => () => {
      stopAmbient();
      masterRef.current?.disconnect();
      void contextRef.current?.close();
      contextRef.current = null;
      masterRef.current = null;
    },
    [stopAmbient],
  );

  const toggle = async () => {
    if (!available) return;
    const next = !enabled;
    if (next) {
      const context = await ensureContext();
      if (!context || !masterRef.current) return;
      enabledRef.current = true;
      setEnabled(true);
      startAmbient(context, masterRef.current);
      void soundCue("success");
    } else {
      enabledRef.current = false;
      setEnabled(false);
      stopAmbient();
    }
    persist(next, volume);
  };

  const updateVolume = (next: number) => {
    setVolume(next);
    volumeRef.current = next;
    persist(enabled, next);
  };

  return (
    <div className="fixed right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full border border-[rgba(215,180,106,0.25)] bg-[#111323]/95 p-2 shadow-xl backdrop-blur md:bottom-5">
      <button
        type="button"
        onClick={toggle}
        disabled={!available}
        aria-label={enabled ? "关闭星空音乐" : "开启星空音乐"}
        aria-pressed={enabled}
        title={
          available
            ? enabled
              ? "关闭星空音乐"
              : "开启原创星空音乐"
            : "当前浏览器不支持音频"
        }
        className="grid h-9 w-9 place-items-center rounded-full text-[#f2da9c] transition-colors hover:bg-white/5 disabled:opacity-40"
      >
        {!enabled ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Music2 className="h-4 w-4" />
        )}
      </button>
      <label className="flex items-center gap-2" title="音乐音量">
        <Volume2 className="h-3.5 w-3.5 text-[#b9b4c8]" aria-hidden />
        <input
          aria-label="音乐音量"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(event) => updateVolume(Number(event.target.value))}
          className="h-1 w-16 accent-[#d7b46a] sm:w-20"
        />
      </label>
    </div>
  );
}
