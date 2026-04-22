import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar [collapsed]="sidebarCollapsed" (toggle)="sidebarCollapsed = !sidebarCollapsed"></app-sidebar>
      <div class="main-area">
        <app-navbar (toggleSidebar)="sidebarCollapsed = !sidebarCollapsed"></app-navbar>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg);
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = false;
}
