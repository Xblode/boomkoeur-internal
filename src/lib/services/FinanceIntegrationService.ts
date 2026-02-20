// Intégration Finance - Synchronisation automatique
import { createTransaction } from '@/lib/localStorage/finance/transactions';
import { Order } from '@/types/order';
import { StockMovementInput } from '@/types/product';
import { productDataService } from './ProductDataService';

/**
 * Crée une transaction Finance automatiquement lors d'une vente
 */
export async function syncOrderToFinance(order: Order): Promise<void> {
  if (order.payment_status !== 'paid') {
    console.log('⏭️ Order not paid, skipping Finance sync');
    return;
  }

  try {
    const fiscalYear = new Date(order.paid_at || order.created_at).getFullYear();
    
    createTransaction({
      fiscal_year: fiscalYear,
      date: order.paid_at || order.created_at,
      label: `Vente Merch - ${order.order_number}`,
      amount: order.total,
      type: 'income',
      category: 'Ventes Merchandising',
      payment_method: order.payment_method === 'stripe' ? 'card' : 
                      order.payment_method === 'transfer' ? 'transfer' : 
                      order.payment_method === 'cash' ? 'cash' : 'other',
      status: 'validated',
      reconciled: true,
      vat_applicable: false,
      notes: `Source: ${order.source} - Client: ${order.customer_name}`,
    });

    console.log(`✅ Finance sync: Transaction created for order ${order.order_number}`);
  } catch (error) {
    console.error('❌ Error syncing order to Finance:', error);
    throw error;
  }
}

/**
 * Crée une transaction Finance automatiquement lors d'un achat fournisseur
 */
export async function syncPurchaseToFinance(
  amount: number,
  providerName: string,
  productName: string,
  quantity: number
): Promise<void> {
  try {
    const fiscalYear = new Date().getFullYear();
    
    createTransaction({
      fiscal_year: fiscalYear,
      date: new Date().toISOString(),
      label: `Achat Merch - ${productName} (x${quantity})`,
      amount: amount,
      type: 'expense',
      category: 'Achats Merchandising',
      payment_method: 'transfer',
      status: 'pending',
      reconciled: false,
      vat_applicable: false,
      notes: `Fournisseur: ${providerName}`,
    });

    console.log(`✅ Finance sync: Purchase transaction created for ${productName}`);
  } catch (error) {
    console.error('❌ Error syncing purchase to Finance:', error);
    throw error;
  }
}
