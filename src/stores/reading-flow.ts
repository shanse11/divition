"use client";

import { create } from "zustand";
import type { DrawnCard, ReadingCategory, ReadingStyle } from "@/types/tarot";

export type ReadingStep = "category" | "question" | "spread" | "style" | "draw";

interface ReadingFlowState {
  step: ReadingStep;
  category: ReadingCategory | null;
  question: string;
  spreadId: string | null;
  style: ReadingStyle;
  drawnCards: DrawnCard[];
  setStep: (step: ReadingStep) => void;
  setCategory: (category: ReadingCategory) => void;
  setQuestion: (question: string) => void;
  setSpreadId: (spreadId: string) => void;
  setStyle: (style: ReadingStyle) => void;
  setDrawnCards: (cards: DrawnCard[]) => void;
  reset: () => void;
}

const initialState = {
  step: "category" as ReadingStep,
  category: null,
  question: "",
  spreadId: null,
  style: "gentle" as ReadingStyle,
  drawnCards: [],
};

export const useReadingFlow = create<ReadingFlowState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setCategory: (category) => set({ category }),
  setQuestion: (question) => set({ question }),
  setSpreadId: (spreadId) => set({ spreadId }),
  setStyle: (style) => set({ style }),
  setDrawnCards: (drawnCards) => set({ drawnCards }),
  reset: () => set(initialState),
}));
