/**
 * Annee de debut pour les selecteurs Finance (tresorerie, budget, bilan, etc.)
 * Les annees sont generees dynamiquement jusqu'a l'annee courante + 1.
 */
const FIRST_FINANCE_YEAR = 2024

/**
 * Retourne la liste des annees disponibles pour les modules Finance.
 * S'etend automatiquement : en 2027, 2027 et 2028 seront ajoutees.
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear()
  const lastYear = currentYear + 1
  const years: number[] = []
  for (let y = FIRST_FINANCE_YEAR; y <= lastYear; y++) {
    years.push(y)
  }
  return years
}
