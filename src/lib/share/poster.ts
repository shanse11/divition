import type { TarotSuit } from "@/types/tarot";

export interface PosterOptions {
  showQuestion: boolean;
  showFullCardReadings: boolean;
  showAdvice: boolean;
  showSpread: boolean;
  showDate: boolean;
  showLogo: boolean;
  showDisclaimer: boolean;
}

export const DEFAULT_POSTER_OPTIONS: PosterOptions = Object.freeze({
  showQuestion: false,
  showFullCardReadings: false,
  showAdvice: false,
  showSpread: true,
  showDate: false,
  showLogo: true,
  showDisclaimer: true,
});

export interface PosterCard {
  id: string;
  name: string;
  nameEn: string;
  label: string;
  suit: TarotSuit;
  seed: number;
  position: string;
  reversed: boolean;
  keywords: string[];
  interpretation?: string;
}

export interface PosterReading {
  id: string;
  question: string;
  spread: { name: string; nameEn: string };
  createdAt: string;
  theme: string;
  summary: string;
  advice: string[];
  disclaimer: string;
  cards: PosterCard[];
}

export interface PosterContent extends Omit<
  PosterReading,
  "question" | "spread" | "createdAt" | "cards" | "disclaimer"
> {
  question?: string;
  spread?: string;
  date?: string;
  logo?: string;
  disclaimer?: string;
  cards: Array<PosterCard & { orientation: "正位" | "逆位" }>;
}

export function derivePosterContent(
  reading: PosterReading,
  options: PosterOptions,
): PosterContent {
  return {
    id: reading.id,
    theme: reading.theme,
    summary: reading.summary,
    advice: options.showAdvice ? reading.advice : [],
    ...(options.showQuestion && reading.question.trim()
      ? { question: reading.question.trim() }
      : {}),
    ...(options.showSpread ? { spread: reading.spread.name } : {}),
    ...(options.showDate
      ? {
          date: new Intl.DateTimeFormat("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          }).format(new Date(reading.createdAt)),
        }
      : {}),
    ...(options.showLogo ? { logo: "Astral Oracle" } : {}),
    ...(options.showDisclaimer && reading.disclaimer.trim()
      ? { disclaimer: reading.disclaimer.trim() }
      : {}),
    cards: reading.cards.map((card) => ({
      ...card,
      orientation: card.reversed ? "逆位" : "正位",
      ...(options.showFullCardReadings && card.interpretation
        ? { interpretation: card.interpretation }
        : { interpretation: undefined }),
    })),
  };
}
