interface NormalizedNote {
  content: string;
  updatedAt: Date;
}

/** Compatibility read: normalized rows win, legacy columns remain a fallback. */
export function resolveFavorite(
  legacyFavorite: boolean,
  normalizedFavorites: ReadonlyArray<{ id: string }>,
): boolean {
  return legacyFavorite || normalizedFavorites.length > 0;
}

/** Compatibility read: the latest normalized note is authoritative, including empty text. */
export function resolveLatestNote(
  legacyNote: string,
  normalizedNotes: ReadonlyArray<NormalizedNote>,
): string {
  if (normalizedNotes.length === 0) return legacyNote;
  return normalizedNotes.reduce((latest, note) =>
    note.updatedAt.getTime() > latest.updatedAt.getTime() ? note : latest,
  ).content;
}
