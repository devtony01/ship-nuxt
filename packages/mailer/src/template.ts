// Template components will be processed by Vue Email
// For now, we'll define the templates as strings and props interfaces

export enum Template {
  RESET_PASSWORD = 'RESET_PASSWORD',
  SIGN_UP_WELCOME = 'SIGN_UP_WELCOME',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

// Component mapping is now handled in utils.ts

export interface ResetPasswordProps {
  firstName: string;
  href: string;
}

export interface SignUpWelcomeProps {
  firstName: string;
  href: string;
}

export interface VerifyEmailProps {
  firstName: string;
  href: string;
}

export interface TemplateProps {
  [Template.RESET_PASSWORD]: ResetPasswordProps;
  [Template.SIGN_UP_WELCOME]: SignUpWelcomeProps;
  [Template.VERIFY_EMAIL]: VerifyEmailProps;
}
