import { Injectable, effect, signal } from '@angular/core';
import { getSupabase } from '../core/supabase';
import { mapOrder } from '../core/mappers';
import type {
  MenuCategory,
  Order,
  OrderStatus,
  RestaurantSettings,
} from '../core/types';
import { AuthService } from './auth.service';

export interface MenuItemInput {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  available: boolean;
  popular: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly supabase = getSupabase();

  readonly orders = signal<Order[]>([]);
  readonly customerOrders = signal<Order[]>([]);
  readonly settings = signal<RestaurantSettings | null>(null);
  readonly loading = signal(true);

  constructor(private readonly auth: AuthService) {
    void this.refreshSettings();

    effect(() => {
      const user = this.auth.user();
      void this.refreshOrders();
      // re-subscribe when staff user changes
      if (user && (user.role === 'admin' || user.role === 'cocinero')) {
        this.subscribeRealtime();
      } else {
        this.unsubscribeRealtime();
      }
    });
  }

  private channel: ReturnType<typeof this.supabase.channel> | null = null;

  private subscribeRealtime() {
    this.unsubscribeRealtime();
    this.channel = this.supabase
      .channel('orders-kanban')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          void this.refreshOrders();
        }
      )
      .subscribe();
  }

  private unsubscribeRealtime() {
    if (this.channel) {
      void this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private async fetchOrdersWithItems(filter?: { customerId?: string }) {
    let query = this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.customerId) {
      query = query.eq('customer_id', filter.customerId);
    }

    const { data: ordersData, error } = await query;
    if (error || !ordersData || ordersData.length === 0) return [];

    const ids = ordersData.map((o) => o.id);
    const { data: itemsData } = await this.supabase
      .from('order_items')
      .select('*')
      .in('order_id', ids);

    const byOrder = new Map<string, NonNullable<typeof itemsData>>();
    for (const item of itemsData ?? []) {
      const list = byOrder.get(item.order_id) ?? [];
      list.push(item);
      byOrder.set(item.order_id, list);
    }

    return ordersData.map((row) => mapOrder(row, byOrder.get(row.id) ?? []));
  }

  async refreshSettings(): Promise<void> {
    const { data } = await this.supabase
      .from('restaurant_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (data) {
      this.settings.set({
        name: data.name,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        hours: data.hours,
        email: data.email,
      });
    }
  }

  async refreshOrders(): Promise<void> {
    this.loading.set(true);
    const user = this.auth.user();
    if (user && (user.role === 'admin' || user.role === 'cocinero')) {
      this.orders.set(await this.fetchOrdersWithItems());
    } else {
      this.orders.set([]);
    }
    if (user) {
      this.customerOrders.set(
        await this.fetchOrdersWithItems({ customerId: user.id })
      );
    } else {
      this.customerOrders.set([]);
    }
    this.loading.set(false);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (!error) await this.refreshOrders();
  }

  async updateOrderNotes(
    orderId: string,
    notes: string
  ): Promise<{ ok: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('orders')
      .update({
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (error) return { ok: false, error: error.message };
    await this.refreshOrders();
    return { ok: true };
  }

  async createOrder(input: {
    customerName: string;
    customerEmail: string;
    phone: string;
    address: string;
    paymentMethod: 'tarjeta' | 'efectivo';
    notes?: string;
    total: number;
    items: {
      menuItemId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }[];
  }): Promise<{ ok: boolean; order?: Order; error?: string }> {
    const user = this.auth.user();
    if (!user) {
      return { ok: false, error: 'Debés iniciar sesión para pedir.' };
    }

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: orderRow, error: orderError } = await this.supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        phone: input.phone,
        address: input.address,
        status: 'recibido',
        total: input.total,
        payment_method: input.paymentMethod,
        notes: input.notes || null,
      })
      .select('*')
      .single();

    if (orderError || !orderRow) {
      return {
        ok: false,
        error: orderError?.message ?? 'No se pudo crear el pedido',
      };
    }

    const { error: itemsError } = await this.supabase.from('order_items').insert(
      input.items.map((item) => ({
        order_id: orderRow.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        notes: item.notes || null,
      }))
    );

    if (itemsError) {
      return { ok: false, error: itemsError.message };
    }

    await this.refreshOrders();
    return { ok: true, order: mapOrder(orderRow, []) };
  }

  async toggleMenuAvailability(
    itemId: string,
    available: boolean
  ): Promise<void> {
    await this.supabase
      .from('menu_items')
      .update({ available })
      .eq('id', itemId);
  }

  async createMenuItem(
    input: MenuItemInput
  ): Promise<{ ok: boolean; error?: string }> {
    const { count } = await this.supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });
    const { error } = await this.supabase.from('menu_items').insert({
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      image_url: input.imageUrl,
      available: input.available,
      popular: input.popular,
      sort_order: (count ?? 0) + 1,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async updateMenuItem(
    id: string,
    input: MenuItemInput
  ): Promise<{ ok: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('menu_items')
      .update({
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        image_url: input.imageUrl,
        available: input.available,
        popular: input.popular,
      })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async deleteMenuItem(id: string): Promise<{ ok: boolean; error?: string }> {
    const { error } = await this.supabase.from('menu_items').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async updateSettings(
    next: RestaurantSettings
  ): Promise<{ ok: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('restaurant_settings')
      .update({
        name: next.name,
        tagline: next.tagline,
        address: next.address,
        phone: next.phone,
        hours: next.hours,
        email: next.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    if (error) return { ok: false, error: error.message };
    this.settings.set(next);
    return { ok: true };
  }
}
