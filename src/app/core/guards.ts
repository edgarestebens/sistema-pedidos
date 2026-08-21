import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

async function waitForAuth(auth: AuthService) {
  const start = Date.now();
  while (auth.loading() && Date.now() - start < 8000) {
    await new Promise((r) => setTimeout(r, 50));
  }
}

export const staffGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForAuth(auth);
  const user = auth.user();
  if (user && (user.role === 'admin' || user.role === 'cocinero')) {
    return true;
  }
  return router.createUrlTree(['/dashboard/login']);
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForAuth(auth);
  if (auth.user()?.role === 'admin') return true;
  return router.createUrlTree(['/dashboard/pedidos']);
};
