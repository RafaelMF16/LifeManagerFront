export default {
  module: {
    label: 'Module',
    name: 'Finance',
  },
  sidebar: {
    navAria: 'Finance module navigation',
    items: {
      months: 'Months',
      categories: 'Categories',
    },
    comingSoon: 'Soon',
    allModules: 'All modules',
    collapse: 'Collapse menu',
    expand: 'Expand menu',
  },
  actions: {
    cancel: 'Cancel',
    close: 'Close',
  },
  categories: {
    title: 'Categories',
    newButton: 'New category',
    list: {
      title: 'All categories',
      count_one: '{{count}} category',
      count_other: '{{count}} categories',
      results_one: '{{count}} result',
      results_other: '{{count}} results',
      searchPlaceholder: 'Search categories',
      columns: {
        name: 'Name',
        actions: 'Actions',
      },
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading categories…',
      loadError: 'Could not load your categories.',
      retry: 'Try again',
      empty: 'No categories yet.',
      noResults: 'No categories match your search.',
    },
    pagination: {
      range_one: '{{from}}–{{to}} of {{count}} category',
      range_other: '{{from}}–{{to}} of {{count}} categories',
      none: '0 categories',
    },
    form: {
      createTitle: 'New category',
      editTitle: 'Edit category',
      nameLabel: 'Name',
      namePlaceholder: 'Groceries, transport, leisure…',
      create: 'Create category',
      save: 'Save',
    },
    delete: {
      title: 'Delete category',
      message: 'Delete the category “{{name}}”? This can’t be undone.',
      confirm: 'Delete',
      errorTitle: 'Could not delete',
    },
    toasts: {
      created: 'Category created',
      updated: 'Category updated',
      deleted: 'Category deleted',
    },
    validation: {
      name: {
        required: 'Enter a category name',
        tooLong: 'Name can’t be longer than 50 characters',
        taken: 'A category with this name already exists',
      },
      notFound: 'This category no longer exists. The list has been refreshed.',
    },
  },
} as const
