import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 class="font-display text-3xl font-semibold text-charcoal">Registro</h1>
      <p class="mt-2 text-sm text-smoke">Creá tu cuenta para pedir online.</p>
      <form class="mt-8 space-y-4" (ngSubmit)="submit()">
        <label class="block">
          <span class="mb-1 block text-sm text-smoke">Nombre</span>
          <input
            required
            [(ngModel)]="name"
            name="name"
            class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
          />
        </label>
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
            minlength="6"
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
          class="btn-ink w-full rounded-md py-3 text-sm font-medium disabled:opacity-50"
        >
          {{ busy ? 'Creando…' : 'Crear cuenta' }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-smoke">
        ¿Ya tenés cuenta?
        <a routerLink="/login" class="text-amber hover:underline">Entrar</a>
      </p>
    </div>
  `,
})
export class CustomerRegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = '';
  busy = false;

  async submit() {
    this.busy = true;
    this.error = '';
    const result = await this.auth.register(this.name, this.email, this.password);
    this.busy = false;
    if (!result.ok) {
      this.error = result.error ?? 'Error al registrarse';
      return;
    }
    void this.router.navigateByUrl('/menu');
  }
}
