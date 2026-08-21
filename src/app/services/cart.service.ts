import { Injectable, computed, effect, signal } from '@angular/core';
import { getSupabase } from '../core/supabase';
import { mapMenuItem } from '../core/mappers';
import type { CartItem, MenuItem } from '../core/types';

const STORAGE_KEY = 'brasas-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly supabase = getSupabase();
  private hydrated = false;

  readonly items = signal<CartItem[]>([]);
  readonly menuItems = signal<MenuItem[]>([]);
  readonly menuLoading = signal(true);

  readonly itemCount = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly lines = computed(() => {
    const menu = this.menuItems();
    return this.items()
      .map((item) => {
        const menuItem = menu.find((m) => m.id === item.menuItemId);
        return menuItem ? { item, menuItem } : null;
      })
      .filter((x): x is { item: CartItem; menuItem: MenuItem } => !!x);
  });

  readonly subtotal = computed(() =>
    this.lines().reduce(
      (sum, { item, menuItem }) => sum + menuItem.price * item.quantity,
      0
    )
  );

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.items.set(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    this.hydrated = true;
    void this.refreshMenu();

    effect(() => {
      const items = this.items();
      if (!this.hydrated) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    });
  }

  async refreshMenu(): Promise<void> {
    this.menuLoading.set(true);
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      this.menuItems.set(data.map(mapMenuItem));
    }
    this.menuLoading.set(false);
  }

  getMenuItem(id: string): MenuItem | undefined {
    return this.menuItems().find((m) => m.id === id);
  }

  addItem(menuItemId: string, quantity = 1, notes?: string): void {
    this.items.update((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId
            ? {
                ...i,
                quantity: i.quantity + quantity,
                notes: notes ?? i.notes,
              }
            : i
        );
      }
      return [...prev, { menuItemId, quantity, notes }];
    });
  }

  removeItem(menuItemId: string): void {
    this.items.update((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  updateQuantity(menuItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(menuItemId);
      return;
    }
    this.items.update((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  }

  updateNotes(menuItemId: string, notes: string): void {
    this.items.update((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i))
    );
  }

  clearCart(): void {
    this.items.set([]);
  }
}
