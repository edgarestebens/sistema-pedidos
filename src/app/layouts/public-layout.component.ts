import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavComponent } from './public-nav.component';
import { PublicFooterComponent } from './public-footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavComponent, PublicFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-public-nav />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-public-footer />
    </div>
  `,
})
export class PublicLayoutComponent {}
