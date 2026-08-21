import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (auth.user(); as user) {
      @if (user.role === 'admin' || user.role === 'cocinero') {
        <aside
          class="flex w-full flex-col border-b border-charcoal/10 bg-charcoal text-cream md:min-h-screen md:w-56 md:border-b-0 md:border-r"
        >
          <div class="px-5 py-5">
            <p class="font-display text-lg font-semibold">
              {{ orders.settings()?.name ?? 'Brasas del Sur' }}
            </p>
            <p class="mt-0.5 text-xs uppercase tracking-wider text-amber">
              {{ user.role === 'admin' ? 'Administración' : 'Cocina' }}
            </p>
          </div>
          <nav class="flex flex-wrap gap-1 px-3 pb-3 md:flex-1 md:flex-col">
            <a
              routerLink="/dashboard/pedidos"
              routerLinkActive="bg-amber/20 text-amber"
              class="rounded-md px-3 py-2 text-sm font-medium text-cream/70 transition hover:bg-cream/5 hover:text-cream"
              >Pedidos</a
            >
            @if (user.role === 'admin') {
              <a
                routerLink="/dashboard/menu"
                routerLinkActive="bg-amber/20 text-amber"
                class="rounded-md px-3 py-2 text-sm font-medium text-cream/70 transition hover:bg-cream/5 hover:text-cream"
                >Menú</a
              >
              <a
                routerLink="/dashboard/ajustes"
                routerLinkActive="bg-amber/20 text-amber"
                class="rounded-md px-3 py-2 text-sm font-medium text-cream/70 transition hover:bg-cream/5 hover:text-cream"
                >Ajustes</a
              >
            }
          </nav>
          <div class="border-t border-cream/10 px-5 py-4">
            <p class="truncate text-sm text-cream/80">{{ user.name }}</p>
            <p class="mt-0.5 text-xs text-cream/40">Rol: {{ user.role }}</p>
            <a
              routerLink="/"
              class="mt-3 block text-xs text-amber hover:underline"
              >Ver sitio como cliente →</a
            >
            <button
              type="button"
              (click)="logout()"
              class="mt-2 text-xs text-cream/50 hover:text-amber"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>
      }
    }
  `,
})
export class DashboardSidebarComponent {
  readonly auth = inject(AuthService);
  readonly orders = inject(OrdersService);
  private readonly router = inject(Router);

  async logout() {
    await this.auth.logout();
    void this.router.navigateByUrl('/dashboard/login');
  }
}
