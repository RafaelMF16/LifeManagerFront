export default {
  theme: {
    label: 'Tema',
    toggleAria: 'Alternar tema',
    light: 'Claro',
    dark: 'Escuro',
  },
  language: {
    label: 'Idioma',
  },
  preferences: {
    saveError: 'Não foi possível salvar suas preferências.',
  },
  logout: 'Sair',
  logoutSuccessToast: 'Você saiu da sua conta.',
  sessionExpiredToast: 'Sua sessão expirou. Entre novamente.',
  pagination: {
    navAria: 'Paginação',
    previous: 'Página anterior',
    next: 'Próxima página',
    page: 'Página {{page}}',
  },
  footer: {
    copyright: '© 2026 LifeManager',
  },
  moduleSidebar: {
    comingSoon: 'Em breve',
    allModules: 'Todos os módulos',
    menu: 'Menu de {{module}}',
    collapse: 'Recolher menu',
    expand: 'Expandir menu',
    close: 'Fechar menu',
  },
  tour: {
    start: 'Tour desta tela',
    step: 'Passo {{current}} de {{total}}',
    previous: 'Anterior',
    next: 'Próximo',
    skip: 'Pular',
    done: 'Concluir',
    close: 'Fechar tour',
  },
  errors: {
    connection: {
      title: 'Erro de conexão',
      message: 'Não foi possível se comunicar com o servidor. Verifique sua conexão e tente novamente.',
    },
    invalidCredentials: 'E-mail ou senha inválidos',
    generic: 'Não foi possível concluir. Tente novamente.',
  },
} as const
