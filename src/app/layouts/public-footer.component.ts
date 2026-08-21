import { Component, inject } from '@angular/core';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  template: `
    <footer class="panel-ink border-t">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-on-media/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p class="font-display text-base text-on-media">
          {{ settings()?.name ?? 'Brasas del Sur' }}
        </p>
        <p>{{ settings()?.address }} · {{ settings()?.phone }}</p>
        <p>{{ settings()?.hours }}</p>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  private readonly orders = inject(OrdersService);
  readonly settings = this.orders.settings;
}
