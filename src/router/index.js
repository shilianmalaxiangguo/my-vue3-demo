import { createRouter, createWebHistory } from 'vue-router'
import Tab from '../components/Tab.vue'
import Flex from '../components/Flex.vue'
import TabDialog from '../views/TabDialog.vue'
import PsqlDemo from '../views/PsqlDemo.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/tab',
    name: 'Tab',
    component: Tab
  },
  {
    path: '/flex',
    name: 'Flex',
    component: Flex
  },
  {
    path: '/nested',
    name: 'Nested',
    component: () => import('../views/Nested.vue'),
    redirect: '/nested/page1',
    children: [
      {
        path: 'page1',
        name: 'NestedPage1',
        component: () => import('../views/nested/Page1.vue')
      },
      {
        path: 'page2',
        name: 'NestedPage2',
        component: () => import('../views/nested/Page2.vue')
      },
      {
        path: 'page3',
        name: 'NestedPage3',
        component: () => import('../views/nested/Page3.vue')
      }
    ]
  },
  {
    path: '/table',
    name: 'Table',
    component: () => import('../views/Table.vue')
  },
  {
    path: '/tab-dialog',
    name: 'TabDialog',
    component: TabDialog
  },
  {
    path: '/psql-demo',
    name: 'PsqlDemo',
    component: PsqlDemo
  },
  {
    path: '/json-editor',
    name: 'JsonEditor',
    component: () => import('../views/JsonEditor.vue')
  },
  {
    path: '/audio-visualizer',
    name: 'AudioVisualizer',
    component: () => import('../components/AudioVisualizer.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 