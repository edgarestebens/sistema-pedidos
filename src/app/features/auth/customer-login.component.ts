import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 class="font-display text-3xl font-semibold text-charcoal">Entrar</h1>
      <p class="mt-2 text-sm text-smoke">
        Demo: cliente&#64;brasas.com / brasas123
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
          {{ busy ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-smoke">
        ¿No tenés cuenta?
        <a routerLink="/registro" class="text-amber hover:underline">Registrate</a>
      </p>
      <p class="mt-4 text-center text-sm text-smoke">
        ¿Sos del local?
        <a routerLink="/dashboard/login" class="text-amber hover:underline"
          >Acceso staff / admin</a
        >
      </p>
    </div>
  `,
})
export class CustomerLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = 'cliente@brasas.com';
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
    const user = this.auth.user();
    if (user?.role === 'admin' || user?.role === 'cocinero') {
      void this.router.navigateByUrl('/dashboard/pedidos');
      return;
    }
    void this.router.navigateByUrl('/menu');
  }
}
