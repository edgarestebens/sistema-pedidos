import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import type { RestaurantSettings } from '../../core/types';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-xl">
      <h1 class="font-display text-2xl font-semibold text-charcoal md:text-3xl">
        Ajustes del negocio
      </h1>
      <p class="mt-1 text-sm text-smoke">Los cambios se guardan en Supabase.</p>

      <form class="mt-8 space-y-4" (ngSubmit)="submit()">
        @for (field of fields; track field.key) {
          <label class="block">
            <span class="mb-1 block text-sm text-smoke">{{ field.label }}</span>
            <input
              [(ngModel)]="form[field.key]"
              [name]="field.key"
              class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
            />
          </label>
        }
        @if (error) {
          <p class="text-sm text-ember">{{ error }}</p>
        }
        <button
          type="submit"
          class="rounded-md bg-charcoal px-6 py-2.5 text-sm font-medium text-cream hover:bg-charcoal-soft"
        >
          {{ saved ? 'Guardado' : 'Guardar cambios' }}
        </button>
      </form>
    </div>
  `,
})
export class SettingsComponent {
  private readonly orders = inject(OrdersService);

  form: RestaurantSettings = {
    name: '',
    tagline: '',
    address: '',
    phone: '',
    hours: '',
    email: '',
  };
  saved = false;
  error = '';

  fields: { key: keyof RestaurantSettings; label: string }[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'tagline', label: 'Eslogan' },
    { key: 'address', label: 'Dirección' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'hours', label: 'Horario' },
    { key: 'email', label: 'Email' },
  ];

  constructor() {
    void this.orders.refreshSettings().then(() => {
      const s = this.orders.settings();
      if (s) this.form = { ...s };
    });
  }

  async submit() {
    this.error = '';
    const result = await this.orders.updateSettings(this.form);
    if (!result.ok) {
      this.error = result.error ?? 'Error al guardar';
      return;
    }
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }
}
