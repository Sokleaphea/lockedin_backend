/**
 * Normalizes raw Gutendex subjects into clean, broad genre categories.
 * - Removes character-specific entries (e.g. "Ahab, Captain (Fictitious character) -- Fiction")
 * - Removes location-specific entries (e.g. "London (England) -- Fiction")
 * - Removes person name entries (e.g. "Wagner, Richard, 1813-1883")
 * - Strips sub-classifications after " -- " keeping the broad genre base
 */
export const normalizeCategories = (subjects: string[]): string[] => {
  const result = new Set<string>();

  for (const subject of subjects) {
    if (subject.includes("(Fictitious character")) continue;

    if (subject.includes(" -- ")) {
      const basePart = subject.split(" -- ")[0].trim();

      if (/\([A-Z][a-z]+\)/.test(basePart)) continue;
      if (/^[A-Z][a-zA-Z]+, [A-Z]/.test(basePart)) continue;

      result.add(basePart);
    } else {
      if (/^[A-Z][a-zA-Z]+, [A-Z][a-z]+ \d{4}/.test(subject)) continue;
      result.add(subject);
    }
  }

  return Array.from(result).sort();
};
