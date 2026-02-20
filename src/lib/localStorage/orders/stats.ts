// localStorage operations for Order Stats
import { OrderStats, OrderStatus, OrderSource } from '@/types/order';
import { getOrders } from './orders';
import { getOrderLinesByOrderId } from './orderLines';

export function getOrderStats(filters?: {
  dateFrom?: Date;
  dateTo?: Date;
}): OrderStats {
  let orders = getOrders();
  
  // Apply date filters
  if (filters?.dateFrom) {
    const dateFrom = new Date(filters.dateFrom).getTime();
    orders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).getTime();
      return orderDate >= dateFrom;
    });
  }
  
  if (filters?.dateTo) {
    const dateTo = new Date(filters.dateTo).getTime();
    orders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).getTime();
      return orderDate <= dateTo;
    });
  }
  
  // Calculate stats
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const pendingOrders = orders.filter(
    (o) => o.status === 'pending_payment' || o.status === 'cart'
  ).length;
  
  // Orders by status
  const ordersByStatus: Record<OrderStatus, number> = {
    cart: 0,
    pending_payment: 0,
    paid: 0,
    preparing: 0,
    shipped: 0,
    delivered: 0,
    returned: 0,
    cancelled: 0,
  };
  
  orders.forEach((o) => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
  });
  
  // Revenue by source
  const revenueBySource: Record<OrderSource, number> = {
    manual: 0,
    online_shop: 0,
    event: 0,
  };
  
  orders
    .filter((o) => o.payment_status === 'paid')
    .forEach((o) => {
      revenueBySource[o.source] = (revenueBySource[o.source] || 0) + o.total;
    });
  
  // Top products
  const productSales: Record<
    string,
    { product_name: string; quantity_sold: number; revenue: number }
  > = {};
  
  orders
    .filter((o) => o.payment_status === 'paid')
    .forEach((o) => {
      const lines = getOrderLinesByOrderId(o.id);
      lines.forEach((line) => {
        if (!productSales[line.product_name]) {
          productSales[line.product_name] = {
            product_name: line.product_name,
            quantity_sold: 0,
            revenue: 0,
          };
        }
        productSales[line.product_name].quantity_sold += line.quantity;
        productSales[line.product_name].revenue += line.total;
      });
    });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10
  
  return {
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    avg_order_value: avgOrderValue,
    pending_orders: pendingOrders,
    orders_by_status: ordersByStatus,
    revenue_by_source: revenueBySource,
    top_products: topProducts,
  };
}
