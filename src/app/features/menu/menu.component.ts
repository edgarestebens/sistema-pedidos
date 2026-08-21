import { Component, computed, inject, signal } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CATEGORY_LABELS, type MenuCategory, type MenuItem } from '../../core/types';
import { PricePipe } from '../../shared/format.pipe';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [PricePipe],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 class="font-display text-3xl font-semibold text-charcoal md:text-4xl">
        Menú
      </h1>
      <p class="mt-2 text-smoke">Elegí y sumá al carrito.</p>

      @if (cart.menuLoading()) {
        <p class="mt-8 text-smoke">Cargando menú…</p>
      } @else {
        <div class="mb-8 mt-8 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            (click)="active.set('todos')"
            [class]="
              active() === 'todos'
                ? 'btn-ink'
                : 'bg-cream-muted text-charcoal/80 hover:bg-charcoal/10'
            "
            class="shrink-0 rounded-md px-4 py-2 text-sm font-medium transition"
          >
            Todos
          </button>
          @for (cat of categories; track cat) {
            <button
              type="button"
              (click)="active.set(cat)"
              [class]="
                active() === cat
                  ? 'btn-ink'
                  : 'bg-cream-muted text-charcoal/80 hover:bg-charcoal/10'
              "
              class="shrink-0 rounded-md px-4 py-2 text-sm font-medium transition"
            >
              {{ labels[cat] }}
            </button>
          }
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of filtered(); track item.id) {
            <article class="overflow-hidden rounded-lg bg-surface shadow-sm">
              <div class="relative h-44 overflow-hidden bg-cream-muted">
                <img
                  [src]="item.image"
                  [alt]="item.name"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between gap-2">
                  <h2 class="font-display text-lg font-semibold text-charcoal">
                    {{ item.name }}
                  </h2>
                  <p class="text-sm font-semibold text-amber">
                    {{ item.price | price }}
                  </p>
                </div>
                <p class="mt-1 line-clamp-2 text-sm text-smoke">
                  {{ item.description }}
                </p>
                <button
                  type="button"
                  [disabled]="!item.available"
                  (click)="add(item)"
                  class="btn-ink mt-4 w-full rounded-md py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {{ item.available ? 'Agregar al carrito' : 'No disponible' }}
                </button>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class MenuComponent {
  readonly cart = inject(CartService);
  readonly active = signal<MenuCategory | 'todos'>('todos');
  readonly labels = CATEGORY_LABELS;
  readonly categories = Object.keys(CATEGORY_LABELS) as MenuCategory[];

  readonly filtered = computed(() => {
    const a = this.active();
    return this.cart
      .menuItems()
      .filter((item) => a === 'todos' || item.category === a);
  });

  add(item: MenuItem) {
    this.cart.addItem(item.id);
  }
}
