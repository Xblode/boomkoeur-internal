// Stock Automation - Impact automatique lors des commandes
import { Order, OrderLine } from '@/types/order';
import { productDataService } from './ProductDataService';
import { orderDataService } from './OrderDataService';

/**
 * Met à jour automatiquement le stock lors d'une commande payée
 */
export async function updateStockFromOrder(orderId: string): Promise<void> {
  try {
    const order = await orderDataService.getOrderById(orderId);
    
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Seulement si la commande est payée
    if (order.payment_status !== 'paid') {
      console.log(`⏭️ Order ${order.order_number} not paid, skipping stock update`);
      return;
    }

    const orderLines = await orderDataService.getOrderLines(orderId);

    // Pour chaque ligne de commande, créer un mouvement de stock "out"
    for (const line of orderLines) {
      if (!line.variant_id) {
        console.warn(`⚠️ No variant_id for line ${line.id}, skipping stock update`);
        continue;
      }

      try {
        await productDataService.addStockMovement({
          product_id: line.product_id,
          variant_id: line.variant_id,
          type: 'out',
          quantity: line.quantity,
          reason: 'sale',
          reference: order.order_number,
          notes: `Vente à ${order.customer_name}`,
          date: order.paid_at || order.created_at,
        });

        console.log(
          `✅ Stock updated: -${line.quantity} for ${line.product_name} (${line.variant_info})`
        );
      } catch (error) {
        console.error(
          `❌ Error updating stock for line ${line.id}:`,
          error
        );
      }
    }

    console.log(`✅ Stock automation: Order ${order.order_number} processed`);
  } catch (error) {
    console.error('❌ Error in updateStockFromOrder:', error);
    throw error;
  }
}

/**
 * Restaure le stock lors d'un retour de commande
 */
export async function restoreStockFromReturn(orderId: string): Promise<void> {
  try {
    const order = await orderDataService.getOrderById(orderId);
    
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Seulement si la commande est retournée
    if (order.status !== 'returned') {
      console.log(`⏭️ Order ${order.order_number} not returned, skipping stock restore`);
      return;
    }

    const orderLines = await orderDataService.getOrderLines(orderId);

    // Pour chaque ligne, créer un mouvement de stock "in"
    for (const line of orderLines) {
      if (!line.variant_id) {
        console.warn(`⚠️ No variant_id for line ${line.id}, skipping stock restore`);
        continue;
      }

      try {
        await productDataService.addStockMovement({
          product_id: line.product_id,
          variant_id: line.variant_id,
          type: 'in',
          quantity: line.quantity,
          reason: 'return',
          reference: order.order_number,
          notes: `Retour de ${order.customer_name}`,
          date: new Date().toISOString(),
        });

        console.log(
          `✅ Stock restored: +${line.quantity} for ${line.product_name} (${line.variant_info})`
        );
      } catch (error) {
        console.error(
          `❌ Error restoring stock for line ${line.id}:`,
          error
        );
      }
    }

    console.log(`✅ Stock automation: Return for order ${order.order_number} processed`);
  } catch (error) {
    console.error('❌ Error in restoreStockFromReturn:', error);
    throw error;
  }
}
