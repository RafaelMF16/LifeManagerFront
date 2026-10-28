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
  {
    id: 'rewards',
    path: '/habits/shop/rewards',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'tabs', target: 'shop.tabs' },
      { id: 'create', target: 'rewards.create' },
      { id: 'filters', target: 'rewards.filters' },
      { id: 'cards', target: 'rewards.cards' },
    ],
  },
  {
    id: 'items',
    path: '/habits/shop/items',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'tabs', target: 'shop.tabs' },
      { id: 'cards', target: 'items.cards' },
      { id: 'undo', target: 'items.undo' },
    ],
  },
  {
    id: 'redemptions',
    path: '/habits/shop/redemptions',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'tabs', target: 'shop.tabs' },
      { id: 'list', target: 'redemptions.list' },
      { id: 'undo', target: 'redemptions.undo' },
    ],
  },
  {
    id: 'achievements',
    path: '/habits/achievements',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'summary', target: 'achievements.summary' },
      { id: 'near', target: 'achievements.near' },
      { id: 'grid', target: 'achievements.grid' },
    ],
  },
  {
    id: 'history',
    path: '/habits/history',
    namespace: 'habits',
    steps: [
      { id: 'intro' },
      { id: 'ledger', target: 'habits.ledger' },
    ],
  },
]
