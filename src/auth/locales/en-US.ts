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
    deletionCancelledToast: 'Welcome back! Your account’s deletion was cancelled.',
    entering: 'Signing in…',
  },
  register: {
    title: 'Create your account',
    subtitle: 'Takes less than a minute.',
    submit: 'Create account',
    hasAccount: 'Already have an account?',
    logIn: 'Log in',
    emailSentMessage: 'Open the link in the e-mail to choose your password and finish signing up.',
  },
  setPassword: {
    title: 'Hi, {{name}}! Choose your password',
    subtitle: "It's the last step to create your account.",
    submit: 'Create account',
    successToast: 'Account created. Log in with your e-mail and password.',
    backToSignUp: 'Back to sign-up',
  },
  forgotPassword: {
    title: 'Forgot your password?',
    subtitle: "Enter your account's e-mail and we'll send you a link to choose a new password.",
    submit: 'Send link',
    emailSentMessage: 'Open the link in the e-mail to choose a new password. It is valid for 1 hour.',
    backToLogin: 'Back to log in',
  },
  resetPassword: {
    title: 'Choose a new password',
    subtitle: "Saving it logs you out of every device you're signed in on.",
    submit: 'Save new password',
    successToast: 'Password changed. Log in with your new password.',
    requestNewLink: 'Request a new link',
  },
  errors: {
    tooManyRequestsTitle: 'Too many attempts',
    tooManyRequests: 'Too many attempts. Try again in a few minutes.',
  },
  emailLink: {
    checking: 'Checking the link…',
    invalidTitle: 'This link has expired or was already used',
    invalidMessage: 'Links are only valid for a short time and can be used once. Request a new one to continue.',
    retry: 'Try again',
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
    email: {
      required: 'Email is required',
      invalid: 'Invalid email',
    },
  },
} as const
