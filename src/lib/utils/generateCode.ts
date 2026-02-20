/**
 * Utilitaire de génération de codes d'identification uniques en base64
 * Format: PRÉFIXE-BASE64COURT (ex: FAC-A3F2B1K2)
 */

/**
 * Génère un code unique au format hybride : préfixe + base64 court
 * 
 * @param prefix - Préfixe du code (ex: 'FAC', 'CMD', 'TRA', 'DEV')
 * @param id - ID unique à encoder (timestamp + random)
 * @param length - Longueur du code base64 (défaut: 8)
 * @returns Code unique au format PRÉFIXE-BASE64 (ex: 'FAC-A3F2B1K2')
 * 
 * @example
 * ```ts
 * const id = '1738512000000-abc123def';
 * const code = generateUniqueCode('FAC', id);
 * // Retourne: 'FAC-A3F2B1K2'
 * ```
 */
export function generateUniqueCode(
  prefix: string,
  id: string,
  length: number = 8
): string {
  // Encoder l'ID en base64 (compatible navigateur)
  const base64 = typeof btoa !== 'undefined' 
    ? btoa(id) 
    : Buffer.from(id).toString('base64');
  
  // Remplacer les caractères spéciaux par des alphanumériques
  // + → P, / → S, = → (retiré)
  const cleanBase64 = base64
    .replace(/\+/g, 'P')
    .replace(/\//g, 'S')
    .replace(/=/g, '');
  
  // Tronquer à la longueur souhaitée
  const shortCode = cleanBase64.slice(0, length).toUpperCase();
  
  // Retourner le format PRÉFIXE-BASE64
  return `${prefix}-${shortCode}`;
}

/**
 * Décode un code d'identification pour retrouver l'ID original
 * 
 * @param code - Code au format PRÉFIXE-BASE64 (ex: 'FAC-A3F2B1K2')
 * @returns ID original ou null si le décodage échoue
 * 
 * @example
 * ```ts
 * const originalId = decodeUniqueCode('FAC-A3F2B1K2');
 * // Retourne l'ID original si possible
 * ```
 */
export function decodeUniqueCode(code: string): string | null {
  try {
    // Extraire la partie base64
    const parts = code.split('-');
    if (parts.length < 2) return null;
    
    const base64Part = parts.slice(1).join('-');
    
    // Restaurer les caractères spéciaux
    const restoredBase64 = base64Part
      .replace(/P/g, '+')
      .replace(/S/g, '/');
    
    // Décoder (compatible navigateur)
    // Note: le code est tronqué donc le décodage complet n'est pas toujours possible
    // Cette fonction est utile surtout pour validation
    const decoded = typeof atob !== 'undefined'
      ? atob(restoredBase64)
      : Buffer.from(restoredBase64, 'base64').toString();
    
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage du code:', error);
    return null;
  }
}

/**
 * Valide le format d'un code d'identification
 * 
 * @param code - Code à valider
 * @param expectedPrefix - Préfixe attendu (optionnel)
 * @returns true si le code est valide
 * 
 * @example
 * ```ts
 * isValidCode('FAC-A3F2B1K2'); // true
 * isValidCode('FAC-A3F2B1K2', 'FAC'); // true
 * isValidCode('INVALID'); // false
 * ```
 */
export function isValidCode(code: string, expectedPrefix?: string): boolean {
  // Format attendu: PRÉFIXE-BASE64 (minimum 3 caractères de préfixe + 1 tiret + 4 caractères base64)
  const codeRegex = /^[A-Z]{3}-[A-Z0-9]{4,}$/;
  
  if (!codeRegex.test(code)) return false;
  
  // Vérifier le préfixe si fourni
  if (expectedPrefix) {
    return code.startsWith(`${expectedPrefix}-`);
  }
  
  return true;
}

/**
 * Extrait le préfixe d'un code d'identification
 * 
 * @param code - Code au format PRÉFIXE-BASE64
 * @returns Préfixe extrait ou null
 * 
 * @example
 * ```ts
 * getCodePrefix('FAC-A3F2B1K2'); // 'FAC'
 * getCodePrefix('CMD-K7P2Q8R5'); // 'CMD'
 * ```
 */
export function getCodePrefix(code: string): string | null {
  const parts = code.split('-');
  return parts.length >= 2 ? parts[0] : null;
}

/**
 * Préfixes des codes d'identification
 */
export const CODE_PREFIXES = {
  INVOICE: 'FAC', // Facture
  QUOTE: 'DEV', // Devis
  ORDER: 'CMD', // Commande
  TRANSACTION: 'TRA', // Transaction
} as const;

export type CodePrefix = typeof CODE_PREFIXES[keyof typeof CODE_PREFIXES];
