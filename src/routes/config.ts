import { lazy } from 'react';
import MainLayout from '@/components/Layouts';
import { routePath } from './routePath';

export const routeConfig = [
  {
    route: routePath.LOGIN,
    page: lazy(() => import('@/pages/Auth/Login')),
    Layout: MainLayout,
    isPrivate: false,
  },
  {
    route: routePath.HOME,
    page: lazy(() => import('@/pages/BrowserMetric')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.BROWSER_METRIC,
    page: lazy(() => import('@/pages/BrowserMetric')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.OVERVIEW,
    page: lazy(() => import('@/pages/Overview')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.USER_DETAIL,
    page: lazy(() => import('@/pages/UserDetail')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.WITHDRAWAL_REQUESTS,
    page: lazy(() => import('@/pages/WithdrawRequests')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.WITHDRAWAL_REQUESTS_DETAIL,
    page: lazy(() => import('@/pages/WithdrawRequests/detail')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.PAYOUTS,
    page: lazy(() => import('@/pages/Payouts')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.PAYOUTS_DETAIL,
    page: lazy(() => import('@/pages/Payouts/detail')),
    Layout: MainLayout,
    isPrivate: true,
  },
  {
    route: routePath.NOT_FOUND,
    page: lazy(() => import('@/pages/NotFound')),
    isPrivate: false,
  },
  {
    route: '*',
    page: lazy(() => import('@/pages/NotFound')),
    isPrivate: false,
  },
];
