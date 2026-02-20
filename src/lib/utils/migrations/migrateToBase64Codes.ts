/**
 * Script de migration pour convertir les anciens codes séquentiels 
 * vers le nouveau format base64
 * 
 * Ancien format: FAC-2026-001, CMD-2026-0001, 2025-0001
 * Nouveau format: FAC-A3F2B1K2, CMD-K7P2Q8R5, TRA-B6N1C4D9
 */

import { generateUniqueCode } from '../generateCode';

interface MigrationResult {
  success: boolean;
  invoicesMigrated: number;
  ordersMigrated: number;
  transactionsMigrated: number;
  errors: string[];
}

/**
 * Récupère les données du localStorage
 */
function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Erreur lecture localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Sauvegarde les données dans le localStorage
 */
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur sauvegarde localStorage key "${key}":`, error);
  }
}

/**
 * Vérifie si un code est dans l'ancien format
 */
function isOldFormat(code: string): boolean {
  // Ancien format: FAC-2026-001, CMD-2026-0001, 2025-0001
  const oldPatterns = [
    /^[A-Z]{3}-\d{4}-\d{3,4}$/, // FAC-2026-001, CMD-2026-0001
    /^\d{4}-\d{4}$/, // 2025-0001
  ];
  
  return oldPatterns.some(pattern => pattern.test(code));
}

/**
 * Migre les factures et devis
 */
function migrateInvoices(): { count: number; errors: string[] } {
  const errors: string[] = [];
  let count = 0;
  
  try {
    const invoices = getFromStorage<any[]>('finance_invoices');
    if (!invoices || invoices.length === 0) {
      console.log('📄 Aucune facture à migrer');
      return { count, errors };
    }
    
    const migratedInvoices = invoices.map(invoice => {
      try {
        // Vérifier si le code est dans l'ancien format
        if (invoice.invoice_number && isOldFormat(invoice.invoice_number)) {
          const prefix = invoice.type === 'invoice' ? 'FAC' : 'DEV';
          const newCode = generateUniqueCode(prefix, invoice.id, 8);
          
          console.log(`📄 Migration: ${invoice.invoice_number} → ${newCode}`);
          count++;
          
          return {
            ...invoice,
            invoice_number: newCode,
            updated_at: new Date().toISOString(),
          };
        }
        return invoice;
      } catch (error) {
        errors.push(`Erreur migration facture ${invoice.id}: ${error}`);
        return invoice;
      }
    });
    
    saveToStorage('finance_invoices', migratedInvoices);
    console.log(`✅ ${count} facture(s) migrée(s)`);
  } catch (error) {
    errors.push(`Erreur migration factures: ${error}`);
  }
  
  return { count, errors };
}

/**
 * Migre les commandes
 */
function migrateOrders(): { count: number; errors: string[] } {
  const errors: string[] = [];
  let count = 0;
  
  try {
    const orders = getFromStorage<any[]>('orders');
    if (!orders || orders.length === 0) {
      console.log('📦 Aucune commande à migrer');
      return { count, errors };
    }
    
    const migratedOrders = orders.map(order => {
      try {
        // Vérifier si le code est dans l'ancien format
        if (order.order_number && isOldFormat(order.order_number)) {
          const newCode = generateUniqueCode('CMD', order.id, 8);
          
          console.log(`📦 Migration: ${order.order_number} → ${newCode}`);
          count++;
          
          return {
            ...order,
            order_number: newCode,
            updated_at: new Date().toISOString(),
          };
        }
        return order;
      } catch (error) {
        errors.push(`Erreur migration commande ${order.id}: ${error}`);
        return order;
      }
    });
    
    saveToStorage('orders', migratedOrders);
    console.log(`✅ ${count} commande(s) migrée(s)`);
  } catch (error) {
    errors.push(`Erreur migration commandes: ${error}`);
  }
  
  return { count, errors };
}

/**
 * Migre les transactions
 */
function migrateTransactions(): { count: number; errors: string[] } {
  const errors: string[] = [];
  let count = 0;
  
  try {
    const transactions = getFromStorage<any[]>('finance_transactions');
    if (!transactions || transactions.length === 0) {
      console.log('💰 Aucune transaction à migrer');
      return { count, errors };
    }
    
    const migratedTransactions = transactions.map(transaction => {
      try {
        // Vérifier si le code est dans l'ancien format
        if (transaction.entry_number && isOldFormat(transaction.entry_number)) {
          const newCode = generateUniqueCode('TRA', transaction.id, 8);
          
          console.log(`💰 Migration: ${transaction.entry_number} → ${newCode}`);
          count++;
          
          return {
            ...transaction,
            entry_number: newCode,
            updated_at: new Date().toISOString(),
          };
        }
        return transaction;
      } catch (error) {
        errors.push(`Erreur migration transaction ${transaction.id}: ${error}`);
        return transaction;
      }
    });
    
    saveToStorage('finance_transactions', migratedTransactions);
    console.log(`✅ ${count} transaction(s) migrée(s)`);
  } catch (error) {
    errors.push(`Erreur migration transactions: ${error}`);
  }
  
  return { count, errors };
}

/**
 * Exécute la migration complète
 */
export async function migrateToBase64Codes(): Promise<MigrationResult> {
  console.log('🚀 Début de la migration vers les codes base64...');
  console.log('');
  
  const startTime = Date.now();
  const allErrors: string[] = [];
  
  // Migrer les factures
  const invoicesResult = migrateInvoices();
  allErrors.push(...invoicesResult.errors);
  
  console.log('');
  
  // Migrer les commandes
  const ordersResult = migrateOrders();
  allErrors.push(...ordersResult.errors);
  
  console.log('');
  
  // Migrer les transactions
  const transactionsResult = migrateTransactions();
  allErrors.push(...transactionsResult.errors);
  
  const duration = Date.now() - startTime;
  
  console.log('');
  console.log('📊 Résumé de la migration:');
  console.log(`   - Factures/Devis: ${invoicesResult.count} migrées`);
  console.log(`   - Commandes: ${ordersResult.count} migrées`);
  console.log(`   - Transactions: ${transactionsResult.count} migrées`);
  console.log(`   - Durée: ${duration}ms`);
  
  if (allErrors.length > 0) {
    console.error('');
    console.error('❌ Erreurs détectées:');
    allErrors.forEach(error => console.error(`   - ${error}`));
  } else {
    console.log('');
    console.log('✅ Migration terminée avec succès !');
  }
  
  return {
    success: allErrors.length === 0,
    invoicesMigrated: invoicesResult.count,
    ordersMigrated: ordersResult.count,
    transactionsMigrated: transactionsResult.count,
    errors: allErrors,
  };
}

/**
 * Fonction helper pour exécuter la migration depuis la console
 * Usage: Dans la console du navigateur, tapez:
 * ```
 * import { runMigration } from '@/lib/utils/migrations/migrateToBase64Codes'
 * runMigration()
 * ```
 */
export function runMigration() {
  migrateToBase64Codes().then(result => {
    if (result.success) {
      console.log('✅ Migration réussie !');
    } else {
      console.error('❌ Migration avec erreurs:', result.errors);
    }
  });
}

// Exporter pour utilisation directe
if (typeof window !== 'undefined') {
  (window as any).__migrateToBase64Codes = migrateToBase64Codes;
  console.log('💡 Migration disponible: window.__migrateToBase64Codes()');
}
