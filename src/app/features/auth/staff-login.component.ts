import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-cream px-4">
      <div class="w-full max-w-md">
        <h1 class="font-display text-3xl font-semibold text-charcoal">
          Acceso staff
        </h1>
        <p class="mt-2 text-sm text-smoke">
          Demo: admin&#64;brasas.com o cocinero&#64;brasas.com / brasas123
        </p>
        <form class="mt-8 space-y-4" (ngSubmit)="submit()">
          <label class="block">
            <span class="mb-1 block text-sm text-smoke">Email</span>
            <input
              type="email"
              required
              [(ngModel)]="email"
              name="email"
              class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm text-smoke">Contraseña</span>
            <input
              type="password"
              required
              [(ngModel)]="password"
              name="password"
              class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
            />
          </label>
          @if (error) {
            <p class="text-sm text-ember">{{ error }}</p>
          }
          <button
            type="submit"
            [disabled]="busy"
            class="w-full rounded-md bg-charcoal py-3 text-sm font-medium text-cream disabled:opacity-50"
          >
            {{ busy ? 'Entrando…' : 'Entrar al panel' }}
          </button>
        </form>
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
