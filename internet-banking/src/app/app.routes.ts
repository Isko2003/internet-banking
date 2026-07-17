import { Routes } from '@angular/router';
import { MainLayout } from './layout/components/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', title: 'Dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'accounts', title: 'Accounts', loadComponent: () => import('./pages/accounts/accounts').then(m => m.Accounts) },
      { path: 'cards', title: 'Cards', loadComponent: () => import('./pages/cards/cards').then(m => m.Cards) },
      { path: 'transactions', title: 'Transactions', loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions) },
      { path: 'transfers', title: 'Transfers', loadComponent: () => import('./pages/transfers/transfers').then(m => m.Transfers) },
      { path: 'payments', title: 'Payments', loadComponent: () => import('./pages/payments/payments').then(m => m.Payments) },
      { path: 'templates', title: 'Templates', loadComponent: () => import('./pages/templates/templates').then(m => m.Templates) },
      { path: 'analytics', title: 'Analytics', loadComponent: () => import('./pages/analytics/analytics').then(m => m.Analytics) },
      { path: 'notifications', title: 'Notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications) },
      { path: 'settings', title: 'Settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) }
];