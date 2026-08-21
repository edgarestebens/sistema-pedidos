import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { PricePipe } from '../../shared/format.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, PricePipe],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      @if (auth.loading()) {
        <p class="py-20 text-center text-smoke">Cargando sesión…</p>
      } @else if (!auth.user()) {
        <div class="py-20 text-center">
          <h1 class="font-display text-2xl font-semibold text-charcoal">
            Iniciá sesión para pagar
          </h1>
          <p class="mt-2 text-smoke">
            Necesitás una cuenta para confirmar el pedido.
          </p>
          <a
            routerLink="/login"
            class="mt-6 inline-block rounded-md bg-charcoal px-5 py-2.5 text-sm text-cream"
            >Ir a login</a
          >
        </div>
      } @else if (cart.itemCount() === 0 && !done) {
        <div class="py-20 text-center">
          <p class="text-smoke">No hay ítems para pagar.</p>
          <a routerLink="/menu" class="mt-4 inline-block text-amber underline"
            >Ir al menú</a
          >
        </div>
      } @else if (done) {
        <div class="mx-auto max-w-md py-20 text-center animate-fade-up">
          <p
            class="text-sm font-semibold uppercase tracking-widest text-amber"
          >
            Pedido confirmado
          </p>
          <h1 class="mt-3 font-display text-3xl font-semibold text-charcoal">
            ¡Las brasas ya trabajan!
          </h1>
          <p class="mt-3 text-smoke">Podés seguir el estado en Mis pedidos.</p>
          <a
            routerLink="/mis-pedidos"
            class="mt-8 inline-block rounded-md bg-charcoal px-6 py-3 text-sm font-medium text-cream"
            >Ver mis pedidos</a
          >
        </div>
      } @else {
        <div class="grid gap-10 lg:grid-cols-[1fr_300px]">
          <form class="space-y-8" (ngSubmit)="submit()">
            <div>
              <h1 class="font-display text-3xl font-semibold text-charcoal">
                Checkout
              </h1>
              <p class="mt-2 text-smoke">
                Completá tus datos y el método de pago (simulado).
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1 block text-sm text-smoke">Nombre</span>
                <input
                  name="name"
                  [(ngModel)]="name"
                  required
                  class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
                />
              </label>
              <label class="block">
                <span class="mb-1 block text-sm text-smoke">Email</span>
                <input
                  name="email"
                  type="email"
                  [(ngModel)]="email"
                  required
                  class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
                />
              </label>
              <label class="block">
                <span class="mb-1 block text-sm text-smoke">Teléfono</span>
                <input
                  name="phone"
                  [(ngModel)]="phone"
                  required
                  class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
                />
              </label>
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-sm text-smoke">Dirección / retiro</span>
                <input
                  name="address"
                  [(ngModel)]="address"
                  required
                  class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
                />
              </label>
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-sm text-smoke">Notas</span>
                <input
                  name="notes"
                  [(ngModel)]="notes"
                  class="w-full rounded-md border border-charcoal/15 bg-surface px-3 py-2.5 outline-none focus:border-amber"
                />
              </label>
            </div>
            <div>
              <p class="mb-2 text-sm text-smoke">Pago</p>
              <div class="flex gap-2">
                <button
                  type="button"
                  (click)="paymentMethod = 'tarjeta'"
                  [class]="
                    paymentMethod === 'tarjeta'
                      ? 'bg-charcoal text-cream'
                      : 'bg-cream-muted text-charcoal'
                  "
                  class="rounded-md px-4 py-2 text-sm font-medium"
                >
                  Tarjeta
                </button>
                <button
                  type="button"
                  (click)="paymentMethod = 'efectivo'"
                  [class]="
                    paymentMethod === 'efectivo'
                      ? 'bg-charcoal text-cream'
                      : 'bg-cream-muted text-charcoal'
                  "
                  class="rounded-md px-4 py-2 text-sm font-medium"
                >
                  Efectivo
                </button>
              </div>
            </div>
            @if (error) {
              <p class="text-sm text-ember">{{ error }}</p>
            }
            <button
              type="submit"
              [disabled]="submitting"
              class="rounded-md bg-amber px-6 py-3 text-sm font-semibold text-charcoal hover:bg-amber-hot disabled:opacity-50"
            >
              {{ submitting ? 'Procesando…' : 'Pagar ' + (cart.subtotal() | price) }}
            </button>
          </form>
          <aside class="h-fit rounded-lg bg-surface p-5">
            <p class="font-semibold text-charcoal">Resumen</p>
            <ul class="mt-3 space-y-2 text-sm text-smoke">
              @for (line of cart.lines(); track line.item.menuItemId) {
                <li>
                  {{ line.item.quantity }}× {{ line.menuItem.name }} —
                  {{ line.menuItem.price * line.item.quantity | price }}
                </li>
              }
            </ul>
            <p class="mt-4 font-display text-xl font-semibold">
              {{ cart.subtotal() | price }}
            </p>
          </aside>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly orders = inject(OrdersService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  phone = '';
  address = 'Retiro en local';
  notes = '';
  paymentMethod: 'tarjeta' | 'efectivo' = 'tarjeta';
  submitting = false;
  done = false;
  error = '';

  constructor() {
    const user = this.auth.user();
    if (user) {
      this.name = user.name;
      this.email = user.email;
      this.phone = user.phone ?? '';
    }
  }

  async submit() {
    this.submitting = true;
    this.error = '';
    const result = await this.orders.createOrder({
      customerName: this.name,
      customerEmail: this.email,
      phone: this.phone,
      address: this.address,
      paymentMethod: this.paymentMethod,
      notes: this.notes || undefined,
      total: this.cart.subtotal(),
      items: this.cart.lines().map(({ item, menuItem }) => ({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        notes: item.notes,
      })),
    });
    this.submitting = false;
    if (!result.ok) {
      this.error = result.error ?? 'Error al crear el pedido';
      return;
    }
    this.cart.clearCart();
    this.done = true;
    setTimeout(() => void this.router.navigateByUrl('/mis-pedidos'), 1800);
  }
}
