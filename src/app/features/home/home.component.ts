import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center"
        [style.backgroundImage]="
          'url(https://images.unsplash.com/photo-1555939594-58edc7c7b5b4?w=1920&q=80)'
        "
      ></div>
      <div class="grill-grain absolute inset-0"></div>
      <div
        class="animate-ember pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ember/25 to-transparent"
      ></div>

      <div
        class="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20"
      >
        <p
          class="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-amber"
        >
          Parrilla · un solo lugar
        </p>
        <h1
          class="animate-fade-up delay-1 mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-6xl md:text-7xl"
        >
          {{ name }}
        </h1>
        <p class="animate-fade-up delay-2 mt-4 max-w-md text-lg text-cream/80">
          {{ tagline }}
        </p>
        <div class="animate-fade-up delay-3 mt-8 flex flex-wrap gap-3">
          <a
            routerLink="/menu"
            class="rounded-md bg-amber px-7 py-3.5 text-sm font-semibold text-charcoal transition hover:bg-amber-hot"
            >Ver menú y pedir</a
          >
          <a
            routerLink="/login"
            class="rounded-md border border-cream/35 px-7 py-3.5 text-sm font-medium text-cream transition hover:border-cream/70"
            >Mi cuenta</a
          >
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private readonly orders = inject(OrdersService);

  get name() {
    return this.orders.settings()?.name ?? 'Brasas del Sur';
  }

  get tagline() {
    return (
      this.orders.settings()?.tagline ?? 'Fuego lento, sabor que no se olvida'
    );
  }
}
