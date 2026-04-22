import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <button class="menu-btn" (click)="toggleSidebar.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <nav class="breadcrumb">
          <span class="breadcrumb-root">Rappi Availability</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          <span class="breadcrumb-current">{{ pageTitle }}</span>
        </nav>
      </div>

      <div class="navbar-right">
        <div class="status-pill">
          <span class="status-dot"></span>
          <span>Backend conectado</span>
        </div>
        <div class="avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: var(--navbar-height);
      padding: 0 24px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .menu-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      transition: all var(--transition);
    }

    .menu-btn:hover {
      background: var(--bg);
      color: var(--text-primary);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .breadcrumb-root {
      color: var(--text-muted);
      font-weight: 500;
    }

    .breadcrumb svg {
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .breadcrumb-current {
      color: var(--text-primary);
      font-weight: 600;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 99px;
      font-size: 11.5px;
      font-weight: 500;
      color: #16a34a;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse-green 2s ease-in-out infinite;
    }

    @keyframes pulse-green {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: var(--brand-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
      cursor: pointer;
      transition: all var(--transition);
    }

    .avatar:hover {
      background: var(--brand-muted);
    }
  `]
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  pageTitle = 'Dashboard';

  private titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/insights': 'Insights IA',
    '/analytics': 'Analytics',
    '/architecture': 'Arquitectura',
    '/about': 'Sobre el Proyecto'
  };

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.pageTitle = this.titleMap[e.urlAfterRedirects] ?? 'Dashboard';
    });
  }
}
