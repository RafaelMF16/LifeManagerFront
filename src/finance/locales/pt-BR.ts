export default {
  module: {
    label: 'Módulo',
    name: 'Financeiro',
  },
  sidebar: {
    navAria: 'Navegação do módulo Financeiro',
    items: {
      months: 'Meses',
      categories: 'Categorias',
    },
    comingSoon: 'Em breve',
    allModules: 'Todos os módulos',
    collapse: 'Recolher menu',
    expand: 'Expandir menu',
  },
  actions: {
    cancel: 'Cancelar',
    close: 'Fechar',
  },
  categories: {
    title: 'Categorias',
    newButton: 'Nova categoria',
    list: {
      title: 'Todas as categorias',
      count_one: '{{count}} categoria cadastrada',
      count_other: '{{count}} categorias cadastradas',
      results_one: '{{count}} resultado',
      results_other: '{{count}} resultados',
      searchPlaceholder: 'Buscar categoria',
      columns: {
        name: 'Nome',
        actions: 'Ações',
      },
      edit: 'Editar',
      delete: 'Excluir',
      loading: 'Carregando categorias…',
      loadError: 'Não foi possível carregar as categorias.',
      retry: 'Tentar novamente',
      empty: 'Nenhuma categoria cadastrada.',
      noResults: 'Nenhuma categoria encontrada para essa busca.',
    },
    pagination: {
      range_one: '{{from}}–{{to}} de {{count}} categoria',
      range_other: '{{from}}–{{to}} de {{count}} categorias',
      none: '0 categorias',
    },
    form: {
      createTitle: 'Nova categoria',
      editTitle: 'Editar categoria',
      nameLabel: 'Nome',
      namePlaceholder: 'Mercado, transporte, lazer…',
      create: 'Criar categoria',
      save: 'Salvar',
    },
    delete: {
      title: 'Excluir categoria',
      message: 'Excluir a categoria “{{name}}”? Essa ação não pode ser desfeita.',
      confirm: 'Excluir',
      errorTitle: 'Não foi possível excluir',
    },
    toasts: {
      created: 'Categoria criada',
      updated: 'Categoria atualizada',
      deleted: 'Categoria excluída',
    },
    validation: {
      name: {
        required: 'Informe o nome da categoria',
        tooLong: 'O nome não pode ter mais de 50 caracteres',
        taken: 'Já existe uma categoria com esse nome',
      },
      notFound: 'Essa categoria não existe mais. A lista foi atualizada.',
    },
  },
} as const
