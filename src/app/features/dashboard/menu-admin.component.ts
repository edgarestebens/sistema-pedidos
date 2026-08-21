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
          <p
            class="font-ticket text-[10px] uppercase tracking-[0.2em] text-dash-quiet"
          >
            Carta · ficha
          </p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Menú
          </h1>
          <p class="mt-1 text-sm text-dash-quiet">
            Creá, editá o pausá platos.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar…"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
            class="dash-input w-full max-w-xs px-3 py-2 text-sm sm:w-52"
          />
          <button
            type="button"
            (click)="openCreate()"
            class="btn-dash-ember rounded-sm px-4 py-2 text-sm"
          >
            Nuevo plato
          </button>
        </div>
      </div>

      @if (error) {
        <p class="mb-4 text-sm text-dash-ember">{{ error }}</p>
      }

      @if (cart.menuLoading()) {
        <p class="text-dash-quiet">Cargando menú…</p>
      } @else if (filtered().length === 0) {
        <p class="py-12 text-center text-sm text-dash-quiet">Sin platos</p>
      } @else {
        <div class="space-y-2">
          @for (item of filtered(); track item.id) {
            <div
              class="dash-ticket flex flex-col gap-3 p-3 pl-4 sm:flex-row sm:items-center"
            >
              <img
                [src]="item.image"
                [alt]="item.name"
                class="h-14 w-20 shrink-0 object-cover"
                style="border-radius: 2px"
              />
              <div class="min-w-0 flex-1">
                <p class="font-semibold">{{ item.name }}</p>
                <p class="font-ticket text-[11px] text-dash-quiet">
                  {{ labels[item.category] }} ·
                  <span class="text-dash-brass">{{ item.price | price }}</span>
                  @if (!item.available) {
                    <span> · pausado</span>
                  }
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  [disabled]="busyId() === item.id"
                  (click)="toggle(item)"
                  class="rounded-sm border border-dash-quiet/30 px-3 py-2 text-xs"
                >
                  {{ item.available ? 'Pausar' : 'Activar' }}
                </button>
                <button
                  type="button"
                  (click)="openEdit(item)"
                  class="rounded-sm border border-dash-quiet/30 px-3 py-2 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  [disabled]="busyId() === item.id"
                  (click)="remove(item)"
                  class="rounded-sm border border-dash-ember/40 px-3 py-2 text-xs text-dash-ember"
                >
                  Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (formOpen()) {
        <div
          class="fixed inset-0 z-50 flex justify-end bg-dash-soot/50"
          (click)="closeForm()"
        >
          <form
            class="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-dash-quiet/20 bg-dash-ash p-5 shadow-xl"
            style="color: inherit"
            (click)="$event.stopPropagation()"
            (ngSubmit)="submit()"
          >
            <p
              class="font-ticket text-[10px] uppercase tracking-[0.18em] text-dash-quiet"
            >
              {{ editingId() ? 'Editar' : 'Nuevo' }}
            </p>
            <h2 class="mt-1 text-xl font-semibold">
              {{ editingId() ? 'Editar plato' : 'Nuevo plato' }}
            </h2>
            <div class="mt-6 space-y-3">
              <input
                [(ngModel)]="form.name"
                name="name"
                placeholder="Nombre"
                required
                class="dash-input w-full px-3 py-2 text-sm"
              />
              <textarea
                [(ngModel)]="form.description"
                name="description"
                placeholder="Descripción"
                rows="2"
                class="dash-input w-full px-3 py-2 text-sm"
              ></textarea>
              <div class="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  [(ngModel)]="form.price"
                  name="price"
                  placeholder="Precio"
                  class="dash-input w-full px-3 py-2 font-ticket text-sm"
                />
                <select
                  [(ngModel)]="form.category"
                  name="category"
                  class="dash-input w-full px-3 py-2 text-sm"
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
                class="dash-input w-full px-3 py-2 text-sm"
              />
              <div class="flex gap-4 text-sm">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="form.available"
                    name="available"
                  />
                  Disponible
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="form.popular"
                    name="popular"
                  />
                  Popular
                </label>
              </div>
            </div>
            <div class="mt-auto flex gap-2 pt-8">
              <button
                type="submit"
                [disabled]="saving"
                class="btn-dash-brass flex-1 rounded-sm py-2.5 text-sm disabled:opacity-50"
              >
                {{
                  saving
                    ? 'Guardando…'
                    : editingId()
                      ? 'Guardar'
                      : 'Crear plato'
                }}
              </button>
              <button
                type="button"
                (click)="closeForm()"
                class="flex-1 rounded-sm border border-dash-quiet/30 py-2.5 text-sm text-dash-quiet"
              >
                Cancelar
              </button>
            </div>
          </form>
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
