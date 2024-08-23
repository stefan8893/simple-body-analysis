import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/welcome',
        name: 'LandingPage',
        component: () => import('pages/LandingPage.vue'),
      },
      {
        path: '/',
        name: 'Home',
        component: () => import('pages/AnalysisDashboard.vue'),
      },

      {
        path: '/daily',
        name: 'Daily',
        component: () => import('pages/weekly/DailyAnalysis.vue'),
      },
      {
        path: '/weekly',
        name: 'Weekly',
        component: () => import('pages/monthly/WeeklyAnalysis.vue'),
      },
      {
        path: '/tabular',
        name: 'Tabular',
        component: () => import('pages/tabular/TableView.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
