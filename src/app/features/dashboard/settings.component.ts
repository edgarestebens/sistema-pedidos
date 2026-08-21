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
      <p
        class="font-ticket text-[10px] uppercase tracking-[0.2em] text-dash-quiet"
      >
        Local · ficha
      </p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
        Ajustes
      </h1>
      <p class="mt-1 text-sm text-dash-quiet">
        Datos que se muestran en el sitio público.
      </p>

      <form class="mt-8 space-y-4" (ngSubmit)="submit()">
        @for (field of fields; track field.key) {
          <label class="block">
            <span
              class="mb-1 block text-xs uppercase tracking-wide text-dash-quiet"
              >{{ field.label }}</span
            >
            <input
              [(ngModel)]="form[field.key]"
              [name]="field.key"
              class="dash-input w-full px-3 py-2.5 text-sm"
            />
          </label>
        }
        @if (error) {
          <p class="text-sm text-dash-ember">{{ error }}</p>
        }
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="btn-dash-brass rounded-sm px-6 py-2.5 text-sm"
          >
            Guardar cambios
          </button>
          @if (saved) {
            <span class="dash-saved font-ticket text-sm">✓ Guardado</span>
          }
        </div>
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
    setTimeout(() => (this.saved = false), 2200);
  }
}
