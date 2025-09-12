import { renderEmailHtml } from './ssr-renderer';
import { Template } from './template';

/**
 * Test utility for rendering email templates
 * This is used for testing and development purposes
 */
export async function testEmailRendering() {
  console.log('Testing email template rendering...\n');

  try {
    // Test Verify Email template
    console.log('1. Testing VERIFY_EMAIL template...');
    const verifyEmailHtml = await renderEmailHtml({
      template: Template.VERIFY_EMAIL,
      params: {
        firstName: 'John',
        href: 'https://ship-nuxt.paracelsus.com/verify-email?token=test-token-123'
      }
    });
    console.log('✅ VERIFY_EMAIL template rendered successfully');
    console.log(`Length: ${verifyEmailHtml.length} characters\n`);

    // Test Sign Up Welcome template
    console.log('2. Testing SIGN_UP_WELCOME template...');
    const welcomeEmailHtml = await renderEmailHtml({
      template: Template.SIGN_UP_WELCOME,
      params: {
        firstName: 'Jane',
        href: 'https://ship-nuxt.paracelsus.com/dashboard'
      }
    });
    console.log('✅ SIGN_UP_WELCOME template rendered successfully');
    console.log(`Length: ${welcomeEmailHtml.length} characters\n`);

    // Test Reset Password template
    console.log('3. Testing RESET_PASSWORD template...');
    const resetPasswordHtml = await renderEmailHtml({
      template: Template.RESET_PASSWORD,
      params: {
        firstName: 'Bob',
        href: 'https://ship-nuxt.paracelsus.com/reset-password?token=reset-token-456'
      }
    });
    console.log('✅ RESET_PASSWORD template rendered successfully');
    console.log(`Length: ${resetPasswordHtml.length} characters\n`);

    console.log('🎉 All email templates rendered successfully!');
    
    return {
      verifyEmail: verifyEmailHtml,
      signUpWelcome: welcomeEmailHtml,
      resetPassword: resetPasswordHtml
    };
  } catch (error) {
    console.error('❌ Error testing email templates:', error);
    throw error;
  }
}

/**
 * Test specific template with custom params
 */
export async function testSpecificTemplate<T extends Template>(
  template: T,
  params: any
): Promise<string> {
  try {
    const html = await renderEmailHtml({ template, params });
    console.log(`✅ Template ${template} rendered successfully`);
    return html;
  } catch (error) {
    console.error(`❌ Error rendering template ${template}:`, error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEmailRendering().catch(console.error);
}