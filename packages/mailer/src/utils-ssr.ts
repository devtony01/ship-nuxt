import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
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

// SSR-based email renderer
export const renderEmailHtml = async <T extends Template>({
  template,
  params
}: {
  template: T
  params: TemplateProps[T]
}): Promise<string> => {
  try {
    const Component = EmailComponents[template]
    
    if (!Component) {
      throw new Error(`Unknown template: ${template}`)
    }
    
    const app = createSSRApp(Component, params as any)
    
    const html = await renderToString(app)
    
    // Wrap in basic HTML structure
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        ${html}
      </body>
      </html>
    `
  } catch (error) {
    console.error(`Error rendering email template ${template}:`, error)
    throw new Error(`Failed to render email template: ${template}`)
  }
}