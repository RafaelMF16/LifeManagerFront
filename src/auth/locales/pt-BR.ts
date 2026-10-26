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
    emailSentMessage: 'Abra o link do e-mail para escolher sua senha e terminar o cadastro.',
  },
  emailSent: {
    title: 'Verifique seu e-mail',
    sentTo: 'Se o endereço estiver certo, enviamos um link para',
    spamHint: 'Não chegou? Confira a caixa de spam ou lixo eletrônico.',
    resend: 'Reenviar e-mail',
    resendIn: 'Reenviar em {{seconds}}s',
    resentToast: 'E-mail reenviado',
    resendFailedTitle: 'Não foi possível reenviar',
    changeEmail: 'Usar outro e-mail',
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
