import { createBrowserRouter } from 'react-router';
import { AdminLayout } from './components/AdminLayout';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { InformationPage } from './pages/InformationPage';
import { LoginPage } from './pages/LoginPage';
import { NotFound } from './pages/NotFound';
import { ServicesPage } from './pages/ServicesPage';
import { StaffPage } from './pages/StaffPage';
import { TrackingPage } from './pages/TrackingPage';
import { lazy } from 'react';

const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then(module => ({ default: module.AdminCustomers })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminEmployees = lazy(() => import('./pages/admin/AdminEmployees').then(module => ({ default: module.AdminEmployees })));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then(module => ({ default: module.AdminProfile })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(module => ({ default: module.AdminSettings })));
const AdminShipments = lazy(() => import('./pages/admin/AdminShipments').then(module => ({ default: module.AdminShipments })));
const AdminVehicles = lazy(() => import('./pages/admin/AdminVehicles').then(module => ({ default: module.AdminVehicles })));

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        Component: AdminDashboard,
      },
      {
        path: 'shipments',
        Component: AdminShipments,
      },
      {
        path: 'employees',
        Component: AdminEmployees,
      },
      {
        path: 'customers',
        Component: AdminCustomers,
      },
      {
        path: 'vehicles',
        Component: AdminVehicles,
      },
      {
        path: 'profile',
        Component: AdminProfile,
      },
      {
        path: 'settings',
        Component: AdminSettings,
      },
    ],
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'services',
        Component: ServicesPage,
      },
      {
        path: 'information',
        Component: InformationPage,
      },
      {
        path: 'about',
        Component: AboutPage,
      },
      {
        path: 'contact',
        Component: ContactPage,
      },
      {
        path: 'staff',
        Component: StaffPage,
      },
      {
        path: 'tracking',
        Component: TrackingPage,
      },
      {
        path: '*',
        Component: NotFound,
      },
    ],
  },
]);
