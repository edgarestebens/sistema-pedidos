import type { Database } from './database.types';
import type { MenuItem, Order, OrderItem } from './types';

type MenuRow = Database['public']['Tables']['menu_items']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export function mapMenuItem(row: MenuRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    image: row.image_url,
    available: row.available,
    popular: row.popular,
    sortOrder: row.sort_order,
  };
}

export function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    notes: row.notes,
  };
}

export function mapOrder(row: OrderRow, items: OrderItemRow[] = []): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    phone: row.phone,
    address: row.address,
    items: items.map(mapOrderItem),
    status: row.status,
    total: row.total,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    notes: row.notes,
  };
}
