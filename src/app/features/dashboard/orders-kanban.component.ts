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
          <p
            class="font-ticket text-[10px] uppercase tracking-[0.2em] text-dash-quiet"
          >
            Pase · en vivo
          </p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Comandas
          </h1>
          <p class="mt-1 text-sm text-dash-quiet">
            Arrastrá el ticket o usá Avanzar. Notas solo si hacen falta.
          </p>
        </div>
        <p class="font-ticket text-sm text-dash-brass">
          {{ activeCount }} vivos · {{ orders.orders().length }} total
        </p>
      </div>

      @if (orders.loading() && orders.orders().length === 0) {
        <p class="text-dash-quiet">Cargando comandas…</p>
      } @else {
        <div
          class="flex gap-3 overflow-x-auto pb-4"
          style="scroll-snap-type: x mandatory"
        >
          @for (status of columns; track status) {
            <div
              class="dash-col w-[min(18rem,85vw)] shrink-0"
              [class.dash-col-flash]="flashStatus() === status"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop(status)"
            >
              <div
                class="flex items-center justify-between px-3 py-3"
              >
                <h2
                  class="font-ticket text-[11px] font-medium uppercase tracking-[0.14em]"
                >
                  {{ statusLabels[status] }}
                </h2>
                <span
                  class="font-ticket rounded-sm bg-dash-soot/10 px-2 py-0.5 text-[11px]"
                  >{{ columnOrders(status).length }}</span
                >
              </div>
              <div [class]="'dash-heat dash-heat-' + status"></div>
              <div class="flex min-h-[220px] flex-1 flex-col gap-3 p-3">
                @if (columnOrders(status).length === 0) {
                  <p
                    class="flex flex-1 items-center justify-center py-8 text-center text-xs text-dash-quiet"
                  >
                    Sin comandas
                  </p>
                }
                @for (order of columnOrders(status); track order.id) {
                  <article
                    draggable="true"
                    (dragstart)="onDragStart(order.id)"
                    (dragend)="draggingId.set(null)"
                    class="dash-ticket kanban-card cursor-grab p-3 pl-4"
                    [class.dragging]="draggingId() === order.id"
                    [class.dash-ticket-enter]="justMoved() === order.id"
                  >
                    <div class="dash-ticket-stub flex items-start justify-between gap-2">
                      <div>
                        <p class="font-ticket text-base font-semibold tracking-tight">
                          {{ order.orderNumber }}
                        </p>
                        <p class="mt-0.5 font-ticket text-[11px] text-dash-quiet">
                          {{ order.createdAt | time }} · {{ order.customerName }}
                        </p>
                      </div>
                      <p class="font-ticket text-xs font-semibold text-dash-brass">
                        {{ order.total | price }}
                      </p>
                    </div>
                    <ul class="space-y-0.5 text-xs leading-snug opacity-90">
                      @for (item of order.items; track $index) {
                        <li>
                          <span class="font-ticket">{{ item.quantity }}×</span>
                          {{ item.name }}
                          @if (item.notes) {
                            <span class="text-dash-quiet"> ({{ item.notes }})</span>
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
                          <p
                            class="whitespace-pre-wrap text-xs italic text-dash-ember"
                          >
                            {{ order.notes }}
                          </p>
                          <button
                            type="button"
                            (click)="startEdit(order)"
                            class="mt-1 text-xs font-medium text-dash-quiet hover:text-dash-ember"
                          >
                            Editar nota
                          </button>
                        } @else {
                          <button
                            type="button"
                            (click)="startEdit(order)"
                            class="text-xs font-medium text-dash-quiet hover:text-dash-ember"
                          >
                            + Nota
                          </button>
                        }
                      } @else {
                        <div class="space-y-1.5">
                          <textarea
                            rows="3"
                            [(ngModel)]="draft"
                            placeholder="Nota para cocina…"
                            class="dash-input w-full resize-none px-2 py-1.5 text-xs"
                          ></textarea>
                          @if (noteError) {
                            <p class="text-xs text-dash-ember">{{ noteError }}</p>
                          }
                          <div class="flex gap-2">
                            <button
                              type="button"
                              [disabled]="savingNote"
                              (click)="saveNote(order.id)"
                              class="btn-dash-brass flex-1 rounded-sm py-2 text-xs disabled:opacity-50"
                            >
                              {{ savingNote ? '…' : 'Guardar' }}
                            </button>
                            <button
                              type="button"
                              [disabled]="savingNote"
                              (click)="editingId.set(null)"
                              class="flex-1 rounded-sm border border-dash-quiet/30 py-2 text-xs text-dash-quiet"
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
                        class="min-h-10 flex-1 rounded-sm border border-dash-quiet/30 py-2 text-xs disabled:opacity-35"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        [disabled]="!canMove(order, 1)"
                        (click)="moveOrder(order, 1)"
                        [class]="
                          status === 'en_cocina' || status === 'recibido'
                            ? 'btn-dash-ember min-h-10 flex-1 rounded-sm py-2 text-xs disabled:opacity-40'
                            : 'btn-dash-brass min-h-10 flex-1 rounded-sm py-2 text-xs disabled:opacity-40'
                        "
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
  readonly flashStatus = signal<OrderStatus | null>(null);
  readonly justMoved = signal<string | null>(null);
  draft = '';
  noteError = '';
  savingNote = false;

  get activeCount() {
    return this.orders
      .orders()
      .filter((o) => o.status !== 'entregado').length;
  }

  columnOrders(status: OrderStatus) {
    return this.orders.orders().filter((o) => o.status === status);
  }

  onDragStart(orderId: string) {
    this.draggingId.set(orderId);
  }

  onDrop(status: OrderStatus) {
    const id = this.draggingId();
    if (id) {
      void this.applyMove(id, status);
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
    if (next) void this.applyMove(order.id, next);
  }

  private async applyMove(orderId: string, status: OrderStatus) {
    await this.orders.updateOrderStatus(orderId, status);
    this.flashStatus.set(status);
    this.justMoved.set(orderId);
    setTimeout(() => {
      if (this.flashStatus() === status) this.flashStatus.set(null);
      if (this.justMoved() === orderId) this.justMoved.set(null);
    }, 600);
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
