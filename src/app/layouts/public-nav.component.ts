import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur-md"
    >
      <div
        class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a
          routerLink="/"
          class="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl"
        >
          {{ brand }}
        </a>

        <nav class="hidden items-center gap-6 md:flex">
          <a
            routerLink="/menu"
            routerLinkActive="text-amber"
            class="text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
            >Menú</a
          >
          <a
            routerLink="/mis-pedidos"
            routerLinkActive="text-amber"
            class="text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
            >Mis pedidos</a
          >
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          @if (auth.user()?.role === 'admin' || auth.user()?.role === 'cocinero') {
            <a
              routerLink="/dashboard/pedidos"
              class="hidden text-sm font-semibold text-amber hover:underline sm:inline"
            >
              Panel {{ auth.user()?.role === 'admin' ? 'admin' : 'cocina' }}
            </a>
          } @else {
            <a
              routerLink="/dashboard/login"
              class="text-sm font-medium text-smoke hover:text-charcoal"
              >Acceso staff</a
            >
          }
          @if (auth.user(); as user) {
            <button
              type="button"
              (click)="logout()"
              class="hidden text-sm text-smoke hover:text-charcoal sm:inline"
            >
              {{ user.name.split(' ')[0] }} · salir
            </button>
          } @else {
            <a
              routerLink="/login"
              class="hidden text-sm font-medium text-charcoal/70 hover:text-charcoal sm:inline"
              >Entrar</a
            >
          }
          <a
            routerLink="/carrito"
            class="relative inline-flex items-center gap-2 rounded-md bg-charcoal px-3 py-2 text-sm font-medium text-cream transition hover:bg-charcoal-soft"
          >
            <span>Carrito</span>
            @if (cart.itemCount() > 0) {
              <span
                class="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-xs font-bold text-charcoal"
                >{{ cart.itemCount() }}</span
              >
            }
          </a>
        </div>
      </div>
    </header>
  `,
})
export class PublicNavComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly orders = inject(OrdersService);

  get brand() {
    return this.orders.settings()?.name ?? 'Brasas del Sur';
  }

  logout() {
    void this.auth.logout();
  }
}
