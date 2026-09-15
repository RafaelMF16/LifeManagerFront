export default {
  tabs: {
    login: 'Entrar',
    signup: 'Criar conta',
  },
  login: {
    title: 'Entrar na sua conta',
    subtitle: 'Organize sua vida financeira e seus hábitos em um só lugar.',
    submit: 'Entrar',
    forgotPassword: 'Esqueceu a senha?',
    noAccount: 'Não tem conta?',
    createAccount: 'Criar conta',
    successToast: 'Login realizado com sucesso',
  },
  register: {
    title: 'Criar sua conta',
    subtitle: 'Leva menos de um minuto.',
    submit: 'Criar conta',
    hasAccount: 'Já tem conta?',
    logIn: 'Entrar',
    successToast: 'Conta criada com sucesso',
  },
  fields: {
    name: {
      label: 'Nome',
      placeholder: 'Seu nome completo',
    },
    email: {
      label: 'E-mail',
      placeholder: 'voce@exemplo.com',
    },
    password: {
      label: 'Senha',
      placeholder: '••••••••',
      hint: 'Mínimo de 8 caracteres',
    },
    confirmPassword: {
      label: 'Confirmar senha',
      placeholder: '••••••••',
    },
  },
  validation: {
    name: {
      required: 'Nome é obrigatório',
      tooLong: 'Nome não pode ter mais de 100 caracteres',
    },
    email: {
      required: 'E-mail é obrigatório',
      invalid: 'E-mail inválido',
      taken: 'Este e-mail já está cadastrado',
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
} as const
