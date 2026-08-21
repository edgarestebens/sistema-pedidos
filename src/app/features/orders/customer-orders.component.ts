import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrdersService } from '../../services/orders.service';
import { STATUS_LABELS } from '../../core/types';
import { PricePipe, TimePipe } from '../../shared/format.pipe';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [RouterLink, PricePipe, TimePipe],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 class="font-display text-3xl font-semibold text-charcoal">
        Mis pedidos
      </h1>

      @if (auth.loading()) {
        <p class="mt-8 text-smoke">Cargando…</p>
      } @else if (!auth.user()) {
        <div class="mt-8 rounded-lg bg-surface p-8 text-center">
          <p class="text-smoke">Iniciá sesión para ver tus pedidos.</p>
          <a
            routerLink="/login"
            class="mt-4 inline-block text-amber underline"
            >Ir a login</a
          >
        </div>
      } @else if (orders.loading() && orders.customerOrders().length === 0) {
        <p class="mt-8 text-smoke">Cargando pedidos…</p>
      } @else if (orders.customerOrders().length === 0) {
        <p class="mt-8 text-smoke">Todavía no tenés pedidos.</p>
        <a routerLink="/menu" class="mt-4 inline-block text-amber underline"
          >Ir al menú</a
        >
      } @else {
        <ul class="mt-8 space-y-4">
          @for (order of orders.customerOrders(); track order.id) {
            <li class="rounded-lg bg-surface p-5 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-charcoal">{{ order.orderNumber }}</p>
                  <p class="text-xs text-smoke">
                    {{ order.createdAt | time }} ·
                    {{ statusLabels[order.status] }}
                  </p>
                </div>
                <p class="text-sm font-semibold text-amber">
                  {{ order.total | price }}
                </p>
              </div>
              <ul class="mt-3 space-y-0.5 text-sm text-charcoal/75">
                @for (item of order.items; track $index) {
                  <li>{{ item.quantity }}× {{ item.name }}</li>
                }
              </ul>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class CustomerOrdersComponent {
  readonly auth = inject(AuthService);
  readonly orders = inject(OrdersService);
  readonly statusLabels = STATUS_LABELS;
}
