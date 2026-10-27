export default {
  theme: {
    label: 'Theme',
    toggleAria: 'Toggle theme',
    light: 'Light',
    dark: 'Dark',
  },
  language: {
    label: 'Language',
  },
  preferences: {
    saveError: 'Could not save your preferences.',
  },
  logout: 'Log out',
  logoutSuccessToast: 'You have been signed out.',
  sessionExpiredToast: 'Your session has expired. Please sign in again.',
  pagination: {
    navAria: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: 'Page {{page}}',
  },
  footer: {
    copyright: '© 2026 LifeManager',
  },
  moduleSidebar: {
    comingSoon: 'Soon',
    allModules: 'All modules',
    menu: '{{module}} menu',
    collapse: 'Collapse menu',
    expand: 'Expand menu',
    close: 'Close menu',
  },
  tour: {
    start: 'Tour of this screen',
    step: 'Step {{current}} of {{total}}',
    previous: 'Back',
    next: 'Next',
    skip: 'Skip',
    done: 'Done',
    close: 'Close tour',
  },
  errors: {
    connection: {
      title: 'Connection error',
      message: 'Could not reach the server. Check your connection and try again.',
    },
    invalidCredentials: 'Invalid email or password',
    generic: 'Could not complete. Please try again.',
  },
} as const
