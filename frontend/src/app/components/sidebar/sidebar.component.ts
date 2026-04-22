import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#FF441A"/>
            <path d="M8 22L12 10L16 18L20 13L24 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="brand-text" *ngIf="!collapsed">
          <span class="brand-name">Rappi</span>
          <span class="brand-sub">Intelligence</span>
        </div>
        <button class="collapse-btn" (click)="toggle.emit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" *ngIf="!collapsed"/>
            <path d="M9 18l6-6-6-6" *ngIf="collapsed"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.path"
          routerLinkActive="active"
          class="nav-item"
          [title]="collapsed ? item.label : ''"
        >
          <span class="nav-icon" [innerHTML]="item.icon"></span>
          <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
          <span class="nav-badge" *ngIf="item.badge && !collapsed">{{ item.badge }}</span>
        </a>
      </nav>

      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="data-indicator">
          <span class="indicator-dot"></span>
          <span class="indicator-text">67,141 registros activos</span>
        </div>
        <div class="period-text">01–11 Feb 2026</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition), min-width var(--transition);
      position: sticky;
      top: 0;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 64px;
      min-width: 64px;
    }

    .sidebar-brand {
      padding: 18px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      min-height: var(--navbar-height);
    }

    .brand-logo {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .brand-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .brand-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.2px;
      white-space: nowrap;
    }

    .brand-sub {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      white-space: nowrap;
    }

    .collapse-btn {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      transition: all var(--transition);
      margin-left: auto;
    }

    .collapse-btn:hover {
      background: var(--bg);
      color: var(--text-primary);
      border-color: var(--border-hover);
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 13.5px;
      font-weight: 500;
      transition: all var(--transition);
      white-space: nowrap;
      position: relative;
    }

    .nav-item:hover {
      background: var(--bg);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--brand-light);
      color: var(--brand);
    }

    .nav-item.active .nav-icon {
      color: var(--brand);
    }

    .nav-icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-icon ::ng-deep svg {
      width: 17px;
      height: 17px;
    }

    .nav-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      background: var(--brand-muted);
      color: var(--brand);
      border-radius: 99px;
    }

    .sidebar-footer {
      padding: 12px 14px 16px;
      border-top: 1px solid var(--border);
    }

    .data-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }

    .indicator-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse-green 2s ease-in-out infinite;
    }

    @keyframes pulse-green {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .indicator-text {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .period-text {
      font-size: 11px;
      color: var(--text-muted);
      padding-left: 13px;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
    },
    {
      label: 'Insights IA',
      path: '/insights',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      badge: 'RAG'
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
    },
    {
      label: 'Arquitectura',
      path: '/architecture',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg>`
    },
    {
      label: 'Sobre el proyecto',
      path: '/about',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    }
  ];
}
