import type { TourDefinition } from '../../shared/types/Tour'

// Copy at `home:tour.<id>.<step>.{title,body}`; each `target` matches a `data-tour` attribute on the screen.
export const HOME_TOURS: TourDefinition[] = [
  {
    id: 'home',
    path: '/home',
    namespace: 'home',
    steps: [
      { id: 'intro' },
      { id: 'habits', target: 'home.habits' },
      { id: 'finance', target: 'home.finance' },
    ],
  },
]
