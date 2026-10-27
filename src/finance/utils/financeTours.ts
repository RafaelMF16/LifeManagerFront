import type { TourDefinition } from '../../shared/types/Tour'

// Copy at `finance:tour.<id>.<step>.{title,body}`; each `target` matches a `data-tour` attribute on the screen.
export const FINANCE_TOURS: TourDefinition[] = [
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
]
