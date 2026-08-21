import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import {
  OrdersService,
  type MenuItemInput,
} from '../../services/orders.service';
import {
  CATEGORY_LABELS,
  type MenuCategory,
  type MenuItem,
} from '../../core/types';
import { PricePipe } from '../../shared/format.pipe';

const EMPTY_FORM: MenuItemInput = {
  name: '',
  description: '',
  price: 0,
  category: 'parrilla',
  imageUrl:
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  available: true,
  popular: false,
};

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [FormsModule, PricePipe],
  template: `
    <div>
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            class="font-display text-2xl font-semibold text-charcoal md:text-3xl"
          >
            Gestionar menú
          </h1>
          <p class="mt-1 text-sm text-smoke">
            Creá, editá o pausá platos (se guarda en Supabase).
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar plato…"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
            class="w-full max-w-xs rounded-md border border-charcoal/15 bg-surface px-3 py-2 text-sm outline-none focus:border-amber sm:w-56"
          />
          <button
            type="button"
            (click)="openCreate()"
            class="rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-cream"
          >
            Nuevo plato
          </button>
        </div>
      </div>

      @if (error) {
        <p class="mb-4 text-sm text-ember">{{ error }}</p>
      }

      @if (formOpen()) {
        <form
          class="mb-8 space-y-3 rounded-lg bg-surface p-4 shadow-sm"
          (ngSubmit)="submit()"
        >
          <h2 class="font-display text-lg font-semibold">
            {{ editingId() ? 'Editar plato' : 'Nuevo plato' }}
          </h2>
          <input
            [(ngModel)]="form.name"
            name="name"
            placeholder="Nombre"
            required
            class="w-full rounded-md border border-charcoal/15 bg-cream px-3 py-2 text-sm outline-none focus:border-amber"
          />
          <textarea
            [(ngModel)]="form.description"
            name="description"
            placeholder="Descripción"
            rows="2"
            class="w-full rounded-md border border-charcoal/15 bg-cream px-3 py-2 text-sm outline-none focus:border-amber"
          ></textarea>
          <div class="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              [(ngModel)]="form.price"
              name="price"
              placeholder="Precio"
              class="w-full rounded-md border border-charcoal/15 bg-cream px-3 py-2 text-sm outline-none focus:border-amber"
            />
            <select
              [(ngModel)]="form.category"
              name="category"
              class="w-full rounded-md border border-charcoal/15 bg-cream px-3 py-2 text-sm outline-none focus:border-amber"
            >
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ labels[cat] }}</option>
              }
            </select>
          </div>
          <input
            [(ngModel)]="form.imageUrl"
            name="imageUrl"
            placeholder="URL imagen"
            class="w-full rounded-md border border-charcoal/15 bg-cream px-3 py-2 text-sm outline-none focus:border-amber"
          />
          <div class="flex gap-4 text-sm">
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.available" name="available" />
              Disponible
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.popular" name="popular" />
              Popular
            </label>
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              [disabled]="saving"
              class="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-50"
            >
              {{ saving ? 'Guardando…' : editingId() ? 'Guardar' : 'Crear plato' }}
            </button>
            <button
              type="button"
              (click)="closeForm()"
              class="rounded-md border border-charcoal/15 px-4 py-2 text-sm text-smoke"
            >
              Cancelar
            </button>
          </div>
        </form>
      }

      @if (cart.menuLoading()) {
        <p class="text-smoke">Cargando menú…</p>
      } @else {
        <div class="space-y-3">
          @for (item of filtered(); track item.id) {
            <div
              class="flex flex-col gap-3 rounded-lg bg-surface p-4 sm:flex-row sm:items-center"
            >
              <img
                [src]="item.image"
                [alt]="item.name"
                class="h-16 w-20 rounded object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-charcoal">{{ item.name }}</p>
                <p class="text-xs text-smoke">
                  {{ labels[item.category] }} · {{ item.price | price }}
                  {{ item.available ? '' : ' · pausado' }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  [disabled]="busyId() === item.id"
                  (click)="toggle(item)"
                  class="rounded border border-charcoal/15 px-3 py-1.5 text-xs"
                >
                  {{ item.available ? 'Pausar' : 'Activar' }}
                </button>
                <button
                  type="button"
                  (click)="openEdit(item)"
                  class="rounded border border-charcoal/15 px-3 py-1.5 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  [disabled]="busyId() === item.id"
                  (click)="remove(item)"
                  class="rounded border border-ember/30 px-3 py-1.5 text-xs text-ember"
                >
                  Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MenuAdminComponent {
  readonly cart = inject(CartService);
  private readonly orders = inject(OrdersService);

  readonly query = signal('');
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly busyId = signal<string | null>(null);
  form: MenuItemInput = { ...EMPTY_FORM };
  saving = false;
  error = '';
  readonly labels = CATEGORY_LABELS;
  readonly categories = Object.keys(CATEGORY_LABELS) as MenuCategory[];

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.cart.menuItems().filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        CATEGORY_LABELS[item.category].toLowerCase().includes(q)
    );
  });

  openCreate() {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.error = '';
    this.formOpen.set(true);
  }

  openEdit(item: MenuItem) {
    this.editingId.set(item.id);
    this.form = {
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.image,
      available: item.available,
      popular: Boolean(item.popular),
    };
    this.error = '';
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.error = '';
  }

  async toggle(item: MenuItem) {
    this.busyId.set(item.id);
    await this.orders.toggleMenuAvailability(item.id, !item.available);
    await this.cart.refreshMenu();
    this.busyId.set(null);
  }

  async remove(item: MenuItem) {
    if (!confirm(`¿Eliminar “${item.name}” del menú?`)) return;
    this.busyId.set(item.id);
    const result = await this.orders.deleteMenuItem(item.id);
    if (!result.ok) this.error = result.error ?? 'No se pudo eliminar';
    await this.cart.refreshMenu();
    this.busyId.set(null);
  }

  async submit() {
    if (!this.form.name.trim() || this.form.price < 0) {
      this.error = 'Nombre y precio válidos son obligatorios.';
      return;
    }
    this.saving = true;
    this.error = '';
    const payload: MenuItemInput = {
      ...this.form,
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      imageUrl: this.form.imageUrl.trim(),
      price: Math.round(Number(this.form.price)),
    };
    const id = this.editingId();
    const result = id
      ? await this.orders.updateMenuItem(id, payload)
      : await this.orders.createMenuItem(payload);
    this.saving = false;
    if (!result.ok) {
      this.error = result.error ?? 'Error al guardar';
      return;
    }
    await this.cart.refreshMenu();
    this.closeForm();
  }
}
