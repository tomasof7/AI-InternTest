import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'insights',
        loadComponent: () => import('./pages/insights/insights.page').then(m => m.InsightsPage)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.page').then(m => m.AnalyticsPage)
      },
      {
        path: 'architecture',
        loadComponent: () => import('./pages/architecture/architecture.page').then(m => m.ArchitecturePage)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
