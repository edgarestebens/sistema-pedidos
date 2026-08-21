import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'brasas-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.readStored());
  readonly resolved = signal<'light' | 'dark'>('light');

  private media: MediaQueryList | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      this.media.addEventListener('change', () => {
        if (this.mode() === 'system') this.apply();
      });
    }

    effect(() => {
      const mode = this.mode();
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        /* ignore */
      }
      this.apply();
    }, { allowSignalWrites: true });
  }

  setMode(mode: ThemeMode) {
    this.mode.set(mode);
  }

  cycle() {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const i = order.indexOf(this.mode());
    this.mode.set(order[(i + 1) % order.length]);
  }

  label(): string {
    switch (this.mode()) {
      case 'dark':
        return 'Oscuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Claro';
    }
  }

  private readStored(): ThemeMode {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
    } catch {
      /* ignore */
    }
    return 'system';
  }

  private apply() {
    if (typeof document === 'undefined') return;
    const mode = this.mode();
    const dark =
      mode === 'dark' ||
      (mode === 'system' &&
        !!this.media?.matches);
    this.resolved.set(dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }
}
