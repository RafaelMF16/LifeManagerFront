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
  account: 'My account',
  actions: {
    cancel: 'Cancel',
  },
  logout: 'Log out',
  logoutSuccessToast: 'You have been signed out.',
  sessionExpiredToast: 'Your session has expired. Please sign in again.',
  splash: {
    loading: 'Loading…',
  },
  routeError: {
    title: 'Something went wrong',
    chunkMessage: 'A new version of the app came out while it was open. Reload to continue.',
    message: 'This screen could not open. Reload to try again.',
    reload: 'Reload',
  },
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
  privacy: {
    hide: 'Hide amounts',
    show: 'Show amounts',
    hiddenValue: 'Hidden amount',
  },
  validation: {
    name: {
      required: 'Name is required',
      tooLong: 'Name cannot be more than 100 characters',
    },
    password: {
      required: 'Password is required',
      tooShort: 'Password must be at least 8 characters',
      tooLong: 'Password cannot be more than 50 characters',
    },
    confirmPassword: {
      required: 'Confirm your password',
      mismatch: "Passwords don't match",
    },
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
