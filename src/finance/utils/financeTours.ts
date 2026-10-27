import type { TourDefinition } from '../../shared/types/Tour'

// Copy at `finance:tour.<id>.<step>.{title,body}`; each `target` matches a `data-tour` attribute on the screen.
export const FINANCE_TOURS: TourDefinition[] = [
  {
    id: 'dashboard',
    path: '/finance/dashboard',
    namespace: 'finance',
    steps: [
      { id: 'intro' },
      { id: 'period', target: 'dashboard.period' },
      { id: 'totals', target: 'dashboard.totals' },
      { id: 'days', target: 'dashboard.days' },
      { id: 'chart', target: 'dashboard.chart' },
      { id: 'budgets', target: 'dashboard.budgets' },
      { id: 'rankings', target: 'dashboard.rankings' },
    ],
  },
  {
    id: 'months',
    path: '/finance/months',
    namespace: 'finance',
    steps: [
      { id: 'intro' },
      { id: 'actions', target: 'months.actions' },
      { id: 'filters', target: 'months.filters' },
      { id: 'sort', target: 'months.sort' },
      { id: 'row', target: 'months.row' },
    ],
  },
  {
    id: 'categories',
    path: '/finance/categories',
    namespace: 'finance',
    steps: [
      { id: 'intro' },
      { id: 'create', target: 'categories.create' },
      { id: 'search', target: 'categories.search' },
      { id: 'row', target: 'categories.row' },
    ],
  },
]
