import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardSidebarComponent } from './dashboard-shell.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, DashboardSidebarComponent],
  template: `
    <div class="flex min-h-screen flex-col md:flex-row">
      <app-dashboard-sidebar />
      <div class="flex-1 bg-cream p-4 sm:p-6 md:p-8">
        <router-outlet />
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {}
