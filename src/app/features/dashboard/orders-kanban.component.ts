import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import {
  KANBAN_COLUMNS,
  STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '../../core/types';
import { PricePipe, TimePipe } from '../../shared/format.pipe';

@Component({
  selector: 'app-orders-kanban',
  standalone: true,
  imports: [FormsModule, PricePipe, TimePipe],
  template: `
    <div>
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            class="font-display text-2xl font-semibold text-charcoal md:text-3xl"
          >
            Pedidos en cocina
          </h1>
          <p class="mt-1 text-sm text-smoke">
            Arrastrá las tarjetas o usá las flechas. Podés añadir notas por
            pedido.
          </p>
        </div>
        <p class="text-sm text-smoke">{{ orders.orders().length }} pedidos</p>
      </div>

      @if (orders.loading() && orders.orders().length === 0) {
        <p class="text-smoke">Cargando pedidos…</p>
      } @else {
        <div class="flex gap-4 overflow-x-auto pb-4">
          @for (status of columns; track status) {
            <div
              class="flex w-72 shrink-0 flex-col rounded-lg bg-cream-muted/60"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop(status)"
            >
              <div
                class="flex items-center justify-between border-b border-charcoal/10 px-3 py-3"
              >
                <h2
                  class="text-sm font-semibold uppercase tracking-wide text-charcoal"
                >
                  {{ statusLabels[status] }}
                </h2>
                <span
                  class="rounded-full bg-charcoal/10 px-2 py-0.5 text-xs font-medium"
                  >{{ columnOrders(status).length }}</span
                >
              </div>
              <div class="flex min-h-[200px] flex-1 flex-col gap-3 p-3">
                @for (order of columnOrders(status); track order.id) {
                  <article
                    draggable="true"
                    (dragstart)="onDragStart(order.id)"
                    (dragend)="draggingId.set(null)"
                    class="kanban-card cursor-grab rounded-md bg-surface p-3 shadow-sm"
                    [class.dragging]="draggingId() === order.id"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <p class="text-sm font-semibold text-charcoal">
                          {{ order.orderNumber }}
                        </p>
                        <p class="text-xs text-smoke">
                          {{ order.createdAt | time }} · {{ order.customerName }}
                        </p>
                      </div>
                      <p class="text-xs font-semibold text-amber">
                        {{ order.total | price }}
                      </p>
                    </div>
                    <ul class="mt-2 space-y-0.5 text-xs text-charcoal/75">
                      @for (item of order.items; track $index) {
                        <li>
                          {{ item.quantity }}× {{ item.name }}
                          @if (item.notes) {
                            <span class="text-smoke"> ({{ item.notes }})</span>
                          }
                        </li>
                      }
                    </ul>

                    <div
                      class="mt-2"
                      (mousedown)="$event.stopPropagation()"
                      (pointerdown)="$event.stopPropagation()"
                    >
                      @if (editingId() !== order.id) {
                        @if (order.notes) {
                          <p class="whitespace-pre-wrap text-xs italic text-ember">
                            {{ order.notes }}
                          </p>
                        } @else {
                          <p class="text-xs text-smoke/70">Sin notas</p>
                        }
                        <button
                          type="button"
                          (click)="startEdit(order)"
                          class="mt-1 text-xs font-medium text-amber hover:underline"
                        >
                          {{ order.notes ? 'Editar nota' : 'Añadir nota' }}
                        </button>
                      } @else {
                        <div class="space-y-1.5">
                          <textarea
                            rows="3"
                            [(ngModel)]="draft"
                            placeholder="Nota para cocina / comentarios…"
                            class="w-full resize-none rounded border border-charcoal/15 bg-cream px-2 py-1.5 text-xs outline-none focus:border-amber"
                          ></textarea>
                          @if (noteError) {
                            <p class="text-xs text-ember">{{ noteError }}</p>
                          }
                          <div class="flex gap-2">
                            <button
                              type="button"
                              [disabled]="savingNote"
                              (click)="saveNote(order.id)"
                              class="flex-1 rounded bg-charcoal py-1 text-xs text-cream disabled:opacity-50"
                            >
                              {{ savingNote ? 'Guardando…' : 'Guardar' }}
                            </button>
                            <button
                              type="button"
                              [disabled]="savingNote"
                              (click)="editingId.set(null)"
                              class="flex-1 rounded border border-charcoal/15 py-1 text-xs text-smoke"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      }
                    </div>

                    <div class="mt-3 flex gap-2">
                      <button
                        type="button"
                        [disabled]="!canMove(order, -1)"
                        (click)="moveOrder(order, -1)"
                        class="flex-1 rounded border border-charcoal/15 py-1.5 text-xs disabled:opacity-40"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        [disabled]="!canMove(order, 1)"
                        (click)="moveOrder(order, 1)"
                        class="flex-1 rounded bg-charcoal py-1.5 text-xs text-cream disabled:opacity-40"
                      >
                        Avanzar →
                      </button>
                    </div>
                  </article>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersKanbanComponent {
  readonly orders = inject(OrdersService);
  readonly columns = KANBAN_COLUMNS;
  readonly statusLabels = STATUS_LABELS;
  readonly draggingId = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  draft = '';
  noteError = '';
  savingNote = false;

  columnOrders(status: OrderStatus) {
    return this.orders.orders().filter((o) => o.status === status);
  }

  onDragStart(orderId: string) {
    this.draggingId.set(orderId);
  }

  onDrop(status: OrderStatus) {
    const id = this.draggingId();
    if (id) {
      void this.orders.updateOrderStatus(id, status);
      this.draggingId.set(null);
    }
  }

  canMove(order: Order, direction: -1 | 1) {
    const idx = KANBAN_COLUMNS.indexOf(order.status);
    return !!KANBAN_COLUMNS[idx + direction];
  }

  moveOrder(order: Order, direction: -1 | 1) {
    const idx = KANBAN_COLUMNS.indexOf(order.status);
    const next = KANBAN_COLUMNS[idx + direction];
    if (next) void this.orders.updateOrderStatus(order.id, next);
  }

  startEdit(order: Order) {
    this.draft = order.notes ?? '';
    this.noteError = '';
    this.editingId.set(order.id);
  }

  async saveNote(orderId: string) {
    this.savingNote = true;
    this.noteError = '';
    const result = await this.orders.updateOrderNotes(orderId, this.draft);
    this.savingNote = false;
    if (!result.ok) {
      this.noteError = result.error ?? 'No se pudo guardar';
      return;
    }
    this.editingId.set(null);
  }
}
