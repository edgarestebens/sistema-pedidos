import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [FormsModule, ThemeToggleComponent],
  template: `
    <div
      class="dash relative flex min-h-screen items-center justify-center px-4"
      style="background: var(--dash-soot); color: var(--dash-chalk)"
    >
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-dash-ember"
      ></div>
      <div class="absolute right-4 top-4">
        <app-theme-toggle variant="ink" />
      </div>
      <div class="w-full max-w-md">
        <p
          class="font-ticket text-[10px] uppercase tracking-[0.2em] text-dash-ember"
        >
          Pase de cocina
        </p>
        <h1 class="mt-2 font-display text-3xl font-semibold text-dash-chalk">
          Acceso staff
        </h1>
        <p class="mt-2 text-sm text-dash-quiet">
          Entrá con tu cuenta de cocina o administración.
        </p>
        <form class="mt-8 space-y-4" (ngSubmit)="submit()">
          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-wide text-dash-quiet"
              >Email</span
            >
            <input
              type="email"
              required
              [(ngModel)]="email"
              name="email"
              class="dash-input w-full px-3 py-2.5 text-sm"
              style="background: #1a1714; color: var(--dash-chalk); border-color: rgba(243,238,228,0.15)"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-wide text-dash-quiet"
              >Contraseña</span
            >
            <input
              type="password"
              required
              [(ngModel)]="password"
              name="password"
              class="dash-input w-full px-3 py-2.5 text-sm"
              style="background: #1a1714; color: var(--dash-chalk); border-color: rgba(243,238,228,0.15)"
            />
          </label>
          @if (error) {
            <p class="text-sm text-dash-ember">{{ error }}</p>
          }
          <button
            type="submit"
            [disabled]="busy"
            class="btn-dash-ember w-full rounded-sm py-3 text-sm disabled:opacity-50"
          >
            {{ busy ? 'Entrando…' : 'Entrar al panel' }}
          </button>
        </form>
        <p class="mt-6 font-ticket text-[10px] text-dash-quiet">
          Demo: admin&#64;brasas.com · cocinero&#64;brasas.com
        </p>
      </div>
    </div>
  `,
})
export class StaffLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = 'admin@brasas.com';
  password = '';
  error = '';
  busy = false;

  async submit() {
    this.busy = true;
    this.error = '';
    const result = await this.auth.login(this.email, this.password);
    this.busy = false;
    if (!result.ok) {
      this.error = result.error ?? 'Error al entrar';
      return;
    }
    const role = this.auth.user()?.role;
    if (role !== 'admin' && role !== 'cocinero') {
      this.error = 'Esta cuenta no tiene acceso al panel.';
      await this.auth.logout();
      return;
    }
    void this.router.navigateByUrl('/dashboard/pedidos');
  }
}
