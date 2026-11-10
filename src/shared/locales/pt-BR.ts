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
  account: 'Minha conta',
  actions: {
    cancel: 'Cancelar',
  },
  logout: 'Sair',
  logoutSuccessToast: 'Você saiu da sua conta.',
  sessionExpiredToast: 'Sua sessão expirou. Entre novamente.',
  splash: {
    loading: 'Carregando…',
  },
  update: {
    available: 'Nova versão disponível',
    action: 'Atualizar',
  },
  routeError: {
    title: 'Algo deu errado',
    chunkMessage: 'Saiu uma versão nova do app enquanto ele estava aberto. Recarregue para continuar.',
    message: 'Não deu para abrir esta tela. Recarregue para tentar de novo.',
    reload: 'Recarregar',
  },
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
  privacy: {
    hide: 'Ocultar valores',
    show: 'Mostrar valores',
    hiddenValue: 'Valor oculto',
  },
  validation: {
    name: {
      required: 'Nome é obrigatório',
      tooLong: 'Nome não pode ter mais de 100 caracteres',
    },
    password: {
      required: 'Senha é obrigatória',
      tooShort: 'Senha deve ter no mínimo 8 caracteres',
      tooLong: 'Senha não pode ter mais de 50 caracteres',
    },
    confirmPassword: {
      required: 'Confirme sua senha',
      mismatch: 'As senhas não coincidem',
    },
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
