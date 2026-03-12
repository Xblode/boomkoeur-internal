/**
 * Extrait les URLs http(s) d'un texte
 */
export function extractUrls(text: string): string[] {
  const regex = /https?:\/\/[^\s<>[\]()]+/gi;
  const matches = text.match(regex) ?? [];
  const seen = new Set<string>();
  return matches.filter((url) => {
    try {
      const normalized = new URL(url).href;
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    } catch {
      return false;
    }
  });
}
