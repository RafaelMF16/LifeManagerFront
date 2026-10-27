import type { TourDefinition } from '../../shared/types/Tour'

// Copy at `habits:tour.<id>.<step>.{title,body}`; each `target` matches a `data-tour` attribute on the screen.
export const HABITS_TOURS: TourDefinition[] = [
  {
    id: 'today',
    path: '/habits/today',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'player', target: 'habits.player' },
      { id: 'empty', target: 'today.empty' },
      { id: 'yesterday', target: 'today.yesterday' },
      { id: 'list', target: 'today.list' },
      { id: 'avoid', target: 'today.avoid' },
    ],
  },
  {
    id: 'habits',
    path: '/habits/list',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'create', target: 'habits.create' },
      { id: 'filters', target: 'habits.filters' },
      { id: 'row', target: 'habits.row' },
    ],
  },
  {
    id: 'details',
    path: '/habits/list/:habitId',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'summary', target: 'details.summary' },
      { id: 'heatmap', target: 'details.heatmap' },
      { id: 'ledger', target: 'habits.ledger' },
    ],
  },
]
