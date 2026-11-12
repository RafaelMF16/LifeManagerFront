import type { TourDefinition } from '../../shared/types/Tour'

// Copy at `account:tour.<id>.<step>.{title,body}`; each `target` matches a section's `data-tour` (`AccountSection`).
export const ACCOUNT_TOURS: TourDefinition[] = [
  {
    id: 'account',
    path: '/account',
    namespace: 'account',
    steps: [
      { id: 'intro' },
      { id: 'profile', target: 'account.profile' },
      { id: 'security', target: 'account.security' },
      { id: 'data', target: 'account.data' },
      { id: 'notifications', target: 'account.notifications' },
      { id: 'danger', target: 'account.danger' },
    ],
  },
]
