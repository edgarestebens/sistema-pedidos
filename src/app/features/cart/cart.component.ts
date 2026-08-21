import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PricePipe } from '../../shared/format.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule, PricePipe],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      @if (cart.itemCount() === 0) {
        <div class="mx-auto max-w-lg py-20 text-center">
          <h1 class="font-display text-3xl font-semibold text-charcoal">
            Tu carrito está vacío
          </h1>
          <p class="mt-3 text-smoke">
            Explorá el menú y sumá algo a las brasas.
          </p>
          <a
            routerLink="/menu"
            class="mt-8 inline-block rounded-md bg-amber px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-amber-hot"
            >Ver menú</a
          >
        </div>
      } @else {
        <div class="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div class="space-y-4">
            <h1 class="font-display text-3xl font-semibold text-charcoal">
              Carrito
            </h1>
            @for (line of cart.lines(); track line.item.menuItemId) {
              <div
                class="flex flex-col gap-4 rounded-lg bg-surface p-4 sm:flex-row"
              >
                <div
                  class="relative h-24 w-full shrink-0 overflow-hidden rounded-md bg-cream-muted sm:w-28"
                >
                  <img
                    [src]="line.menuItem.image"
                    [alt]="line.menuItem.name"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h2 class="font-display text-lg font-semibold">
                        {{ line.menuItem.name }}
                      </h2>
                      <p class="text-sm text-amber">
                        {{ line.menuItem.price | price }}
                      </p>
                    </div>
                    <button
                      type="button"
                      (click)="cart.removeItem(line.item.menuItemId)"
                      class="text-sm text-smoke hover:text-ember"
                    >
                      Quitar
                    </button>
                  </div>
                  <div class="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      (click)="
                        cart.updateQuantity(
                          line.item.menuItemId,
                          line.item.quantity - 1
                        )
                      "
                      class="flex h-8 w-8 items-center justify-center rounded-md bg-cream-muted text-lg"
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span class="w-6 text-center text-sm font-medium">{{
                      line.item.quantity
                    }}</span>
                    <button
                      type="button"
                      (click)="
                        cart.updateQuantity(
                          line.item.menuItemId,
                          line.item.quantity + 1
                        )
                      "
                      class="flex h-8 w-8 items-center justify-center rounded-md bg-cream-muted text-lg"
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="text"
                    class="mt-3 w-full rounded-md border border-charcoal/10 bg-cream px-3 py-2 text-sm outline-none focus:border-amber"
                    placeholder="Notas (ej. a punto, sin cebolla)"
                    [ngModel]="line.item.notes ?? ''"
                    (ngModelChange)="
                      cart.updateNotes(line.item.menuItemId, $event)
                    "
                  />
                </div>
              </div>
            }
          </div>
          <aside class="h-fit rounded-lg bg-surface p-5 shadow-sm">
            <p class="text-sm text-smoke">Subtotal</p>
            <p class="mt-1 font-display text-2xl font-semibold text-charcoal">
              {{ cart.subtotal() | price }}
            </p>
            <a
              routerLink="/checkout"
              class="mt-6 block rounded-md bg-amber py-3 text-center text-sm font-semibold text-charcoal hover:bg-amber-hot"
              >Ir a pagar</a
            >
          </aside>
        </div>
      }
    </div>
  `,
})
export class CartComponent {
  readonly cart = inject(CartService);
}
