import { Component, inject, Input } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="theme.cycle()"
      [class]="
        variant === 'ink'
          ? 'theme-toggle-ink inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition'
          : 'inline-flex items-center gap-1.5 rounded-md border border-charcoal/15 bg-surface px-2.5 py-1.5 text-xs font-medium text-charcoal/80 transition hover:border-amber/50 hover:text-charcoal'
      "
      [attr.aria-label]="'Tema: ' + theme.label()"
      [title]="'Tema: ' + theme.label() + ' (clic para cambiar)'"
    >
      <span aria-hidden="true">{{ icon }}</span>
      <span class="hidden sm:inline">{{ theme.label() }}</span>
    </button>
  `,
})
export class ThemeToggleComponent {
  @Input() variant: 'default' | 'ink' = 'default';
  readonly theme = inject(ThemeService);

  get icon() {
    switch (this.theme.mode()) {
      case 'dark':
        return '☾';
      case 'system':
        return '◐';
      default:
        return '☀';
    }
  }
}
