import { Injectable, signal, computed } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '../core/supabase';
import type { AppUser, UserRole } from '../core/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = getSupabase();

  readonly authUser = signal<User | null>(null);
  readonly user = signal<AppUser | null>(null);
  readonly loading = signal(true);

  readonly isStaff = computed(() => {
    const role = this.user()?.role;
    return role === 'admin' || role === 'cocinero';
  });

  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  constructor() {
    void this.init();
  }

  private async loadProfile(authUser: User): Promise<AppUser | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, full_name, role, phone')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.full_name,
      email: authUser.email ?? '',
      role: data.role as UserRole,
      phone: data.phone,
    };
  }

  private async init() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.authUser.set(session.user);
      this.user.set(await this.loadProfile(session.user));
    }
    this.loading.set(false);

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        this.authUser.set(session.user);
        this.user.set(await this.loadProfile(session.user));
      } else {
        this.authUser.set(null);
        this.user.set(null);
      }
      this.loading.set(false);
    });
  }

  async refreshProfile(): Promise<void> {
    const {
      data: { user: current },
    } = await this.supabase.auth.getUser();
    if (!current) {
      this.authUser.set(null);
      this.user.set(null);
      return;
    }
    this.authUser.set(current);
    this.user.set(await this.loadProfile(current));
  }

  async login(
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    await this.refreshProfile();
    return { ok: true };
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> {
    if (!name.trim() || !email.trim()) {
      return { ok: false, error: 'Completá nombre y email.' };
    }
    const { error } = await this.supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) return { ok: false, error: error.message };
    await this.refreshProfile();
    return { ok: true };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.authUser.set(null);
    this.user.set(null);
  }
}
