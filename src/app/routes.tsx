import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { CourierLayout } from './components/CourierLayout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { InformationPage } from './pages/InformationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { StaffPage } from './pages/StaffPage';
import { TrackingPage } from './pages/TrackingPage';
import { LoginPage } from './pages/LoginPage';
import { CourierDashboard } from './pages/courier/CourierDashboard';
import { CourierTracking } from './pages/courier/CourierTracking';
import { CourierHistory } from './pages/courier/CourierHistory';
import { CourierProfile } from './pages/courier/CourierProfile';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/courier',
    Component: CourierLayout,
    children: [
      {
        path: 'dashboard',
        Component: CourierDashboard,
      },
      {
        path: 'tracking',
        Component: CourierTracking,
      },
      {
        path: 'history',
        Component: CourierHistory,
      },
      {
        path: 'profile',
        Component: CourierProfile,
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