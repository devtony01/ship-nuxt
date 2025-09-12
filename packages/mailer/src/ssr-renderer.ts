import { render } from '@vue-email/render'
import type { Component } from 'vue'
import { Template, TemplateProps } from './template'

// Import Vue email templates
import VerifyEmailTemplate from '../emails/verify-email.vue'
import ResetPasswordTemplate from '../emails/reset-password.vue'
import SignUpWelcomeTemplate from '../emails/sign-up-welcome.vue'

// Component mapping
const EmailComponents: Record<Template, Component> = {
  [Template.VERIFY_EMAIL]: VerifyEmailTemplate,
  [Template.RESET_PASSWORD]: ResetPasswordTemplate,
  [Template.SIGN_UP_WELCOME]: SignUpWelcomeTemplate,
}

// Vue Email renderer (matching my-ship-app pattern)
export const renderEmailHtml = async <T extends Template>({
  template,
  params
}: {
  template: T
  params: TemplateProps[T]
}): Promise<string> => {
  const Component = EmailComponents[template]
  
  return render(Component, params as any)
}
    
