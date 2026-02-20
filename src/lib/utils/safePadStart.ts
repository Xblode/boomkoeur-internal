/**
 * Version sécurisée de padStart qui garantit un nombre valide
 * Évite l'erreur "Invalid count value" de String.repeat()
 * 
 * @param value - La valeur à formater (number ou string)
 * @param length - La longueur finale souhaitée
 * @param fillString - Le caractère de remplissage (défaut: '0')
 * @returns La chaîne formatée
 */
export function safePadStart(
  value: number | string, 
  length: number, 
  fillString: string = '0'
): string {
  // Convertir la valeur en nombre
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  
  // Valider la valeur
  if (isNaN(num) || num < 0) {
    console.warn(`⚠️ safePadStart: valeur invalide (${value}), utilisation de 0`)
    const safeLength = Math.max(1, length) // Au moins 1 pour éviter les erreurs
    return String(0).padStart(safeLength, fillString)
  }
  
  // Valider la longueur
  const safeLength = Math.max(1, length) // Au moins 1 pour éviter les erreurs
  if (safeLength !== length) {
    console.warn(`⚠️ safePadStart: length invalide (${length}), utilisation de ${safeLength}`)
  }
  
  return String(num).padStart(safeLength, fillString)
}
