import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrdersService } from '../services/orders.service';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    @if (auth.user(); as user) {
      @if (user.role === 'admin' || user.role === 'cocinero') {
        <aside
          class="dash-rail flex w-full flex-col border-b md:min-h-screen md:w-56 md:border-b-0 md:border-r"
        >
          <div class="px-5 py-5">
            <p class="font-display text-lg font-semibold text-dash-chalk">
              {{ orders.settings()?.name ?? 'Brasas del Sur' }}
            </p>
            <p
              class="mt-1 font-ticket text-[10px] uppercase tracking-[0.18em] text-dash-ember"
            >
              {{ user.role === 'admin' ? 'Administración' : 'Cocina' }}
            </p>
          </div>
          <nav class="flex flex-wrap gap-0.5 px-2 pb-3 md:flex-1 md:flex-col">
            <a
              routerLink="/dashboard/pedidos"
              routerLinkActive="dash-nav-active"
              class="rounded-sm px-3 py-2.5 text-sm font-medium text-dash-chalk/65 transition hover:bg-dash-chalk/5 hover:text-dash-chalk"
              >Pedidos</a
            >
            @if (user.role === 'admin') {
              <a
                routerLink="/dashboard/menu"
                routerLinkActive="dash-nav-active"
                class="rounded-sm px-3 py-2.5 text-sm font-medium text-dash-chalk/65 transition hover:bg-dash-chalk/5 hover:text-dash-chalk"
                >Menú</a
              >
              <a
                routerLink="/dashboard/ajustes"
                routerLinkActive="dash-nav-active"
                class="rounded-sm px-3 py-2.5 text-sm font-medium text-dash-chalk/65 transition hover:bg-dash-chalk/5 hover:text-dash-chalk"
                >Ajustes</a
              >
            }
          </nav>
          <div class="border-t border-dash-chalk/10 px-4 py-4">
            <div class="mb-3">
              <app-theme-toggle variant="ink" />
            </div>
            <p class="truncate text-sm text-dash-chalk/85">{{ user.name }}</p>
            <a
              routerLink="/"
              class="mt-3 block text-xs text-dash-brass hover:underline"
              >Ver sitio como cliente →</a
            >
            <button
              type="button"
              (click)="logout()"
              class="mt-2 text-xs text-dash-quiet hover:text-dash-ember"
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
