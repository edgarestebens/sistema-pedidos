import { Routes } from '@angular/router';
import { adminGuard, staffGuard } from './core/guards';
import { PublicLayoutComponent } from './layouts/public-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { HomeComponent } from './features/home/home.component';
import { MenuComponent } from './features/menu/menu.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { CustomerLoginComponent } from './features/auth/customer-login.component';
import { CustomerRegisterComponent } from './features/auth/customer-register.component';
import { CustomerOrdersComponent } from './features/orders/customer-orders.component';
import { StaffLoginComponent } from './features/auth/staff-login.component';
import { OrdersKanbanComponent } from './features/dashboard/orders-kanban.component';
import { MenuAdminComponent } from './features/dashboard/menu-admin.component';
import { SettingsComponent } from './features/dashboard/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'carrito', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'login', component: CustomerLoginComponent },
      { path: 'registro', component: CustomerRegisterComponent },
      { path: 'mis-pedidos', component: CustomerOrdersComponent },
    ],
  },
  { path: 'dashboard/login', component: StaffLoginComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [staffGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      { path: 'pedidos', component: OrdersKanbanComponent },
      {
        path: 'menu',
        component: MenuAdminComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'ajustes',
        component: SettingsComponent,
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
