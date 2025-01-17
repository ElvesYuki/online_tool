import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const TOOL: AppRouteRecordRaw = {
  path: '/tool',
  name: 'tool',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.tool',
    requiresAuth: false,
    icon: 'icon-list',
    order: 4,
  },
  children: [
    {
      path: 'ai-config',
      name: 'ai-config',
      component: () => import('@/views/tool/ai-config/index.vue'),
      meta: {
        locale: 'menu.tool.aiConfig',
        requiresAuth: false,
        roles: ['admin'],
      },
    },
    {
      path: 'ticket-generator',
      name: 'ticket-generator',
      component: () => import('@/views/tool/ticket-generator/index.vue'),
      meta: {
        locale: 'menu.tool.ticketGenerator',
        requiresAuth: false,
        roles: ['admin'],
      },
    },
  ],
};

export default TOOL;
