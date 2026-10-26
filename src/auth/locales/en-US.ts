export default {
  tabs: {
    login: 'Log in',
    signup: 'Create account',
  },
  login: {
    title: 'Log in to your account',
    subtitle: 'Organize your finances and habits in one place.',
    submit: 'Log in',
    forgotPassword: 'Forgot your password?',
    noAccount: "Don't have an account?",
    createAccount: 'Create account',
    successToast: 'Logged in successfully',
  },
  register: {
    title: 'Create your account',
    subtitle: 'Takes less than a minute.',
    submit: 'Create account',
    hasAccount: 'Already have an account?',
    logIn: 'Log in',
    emailSentMessage: 'Open the link in the e-mail to choose your password and finish signing up.',
  },
  emailSent: {
    title: 'Check your e-mail',
    sentTo: "If the address is right, we've sent a link to",
    spamHint: "Didn't get it? Check your spam or junk folder.",
    resend: 'Resend e-mail',
    resendIn: 'Resend in {{seconds}}s',
    resentToast: 'E-mail sent again',
    resendFailedTitle: "Couldn't resend",
    changeEmail: 'Use another e-mail',
  },
  fields: {
    name: {
      label: 'Name',
      placeholder: 'Your full name',
    },
    email: {
      label: 'Email',
      placeholder: 'you@example.com',
    },
    password: {
      label: 'Password',
      placeholder: '••••••••',
      hint: 'Minimum of 8 characters',
    },
    confirmPassword: {
      label: 'Confirm password',
      placeholder: '••••••••',
    },
  },
  validation: {
    name: {
      required: 'Name is required',
      tooLong: 'Name cannot be more than 100 characters',
    },
    email: {
      required: 'Email is required',
      invalid: 'Invalid email',
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
} as const
