import { expect, Page } from '@playwright/test';
import config from 'config';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  params: Record<string, unknown>;
}

export class TestUtils {
  private capturedEmails: EmailData[] = [];
  
  constructor(private page: Page) {}

  /**
   * Fill the sign-up form with valid data
   */
  async fillSignUpForm(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  } = {}) {
    const defaultData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      ...data,
    };

    await this.page.getByLabel('First Name').fill(defaultData.firstName);
    await this.page.getByLabel('Last Name').fill(defaultData.lastName);
    await this.page.getByLabel('Email Address').fill(defaultData.email);
    await this.page.getByLabel('Password').fill(defaultData.password);

    return defaultData;
  }

  /**
   * Submit the sign-up form
   */
  async submitSignUpForm() {
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }

  /**
   * Wait for and verify successful sign-up
   */
  async verifySignUpSuccess(email: string) {
    await expect(this.page.getByText('Thanks!')).toBeVisible();
    await expect(this.page.getByText('Please follow the instructions from the email')).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
  }

  /**
   * Verify validation error for a specific field
   */
  async verifyValidationError(fieldName: string, errorMessage: string) {
    await expect(this.page.getByText(errorMessage)).toBeVisible();
  }

  /**
   * Navigate to sign-up page
   */
  async goToSignUp() {
    await this.page.goto('/sign-up');
  }

  /**
   * Navigate to sign-in page
   */
  async goToSignIn() {
    await this.page.goto('/');
  }

  /**
   * Generate unique test email
   */
  generateTestEmail(prefix = 'test') {
    return `${prefix}-${Date.now()}@example.com`;
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if element is visible with timeout
   */
  async isVisible(selector: string, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}-${Date.now()}.png` });
  }

  /**
   * Mock API response
   */
  async mockApiResponse(endpoint: string, response: unknown, status = 200) {
    await this.page.route(`**${endpoint}`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mock API error
   */
  async mockApiError(endpoint: string, status = 500, error = 'Internal Server Error') {
    await this.page.route(`**${endpoint}`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error }),
      });
    });
  }

  /**
   * Mock email service to capture sent emails
   */
  async mockEmailService() {
    this.capturedEmails = [];
    
    // Intercept email sending requests (if your API has an email endpoint)
    await this.page.route('**/send-email', route => {
      const request = route.request();
      const emailData = request.postDataJSON() as EmailData;
      this.capturedEmails.push(emailData);
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-message-id' })
      });
    });
  }

  /**
   * Get captured emails
   */
  getCapturedEmails(): EmailData[] {
    return this.capturedEmails;
  }

  /**
   * Get the last captured email
   */
  getLastCapturedEmail(): EmailData | undefined {
    return this.capturedEmails[this.capturedEmails.length - 1];
  }

  /**
   * Find captured email by recipient
   */
  findEmailByRecipient(email: string): EmailData | undefined {
    return this.capturedEmails.find(emailData => emailData.to === email);
  }

  /**
   * Find captured email by template
   */
  findEmailByTemplate(template: string): EmailData | undefined {
    return this.capturedEmails.find(emailData => emailData.template === template);
  }

  /**
   * Verify that an email was sent
   */
  async verifyEmailSent(recipient: string, template?: string): Promise<EmailData> {
    const email = template 
      ? this.capturedEmails.find(e => e.to === recipient && e.template === template)
      : this.findEmailByRecipient(recipient);
    
    if (!email) {
      throw new Error(`No email found for recipient: ${recipient}${template ? ` with template: ${template}` : ''}`);
    }
    
    return email;
  }

  /**
   * Clear captured emails
   */
  clearCapturedEmails() {
    this.capturedEmails = [];
  }

  /**
   * Mock successful signup with email verification
   */
  async mockSignUpWithEmailVerification(emailVerificationToken?: string) {
    const token = emailVerificationToken || `test-token-${Date.now()}`;
    
    await this.page.route('**/account/sign-up', route => {
      const request = route.request();
      const signUpData = request.postDataJSON();
      
      // Simulate email being sent
      this.capturedEmails.push({
        to: signUpData.email,
        subject: 'Please Confirm Your Email Address for Ship',
        template: 'VERIFY_EMAIL',
        params: {
          firstName: signUpData.firstName,
          href: `http://localhost:3001/account/verify-email?token=${token}`
        }
      });
      
      route.fulfill({
        status: config.IS_DEV ? 200 : 204,
        contentType: 'application/json',
        body: config.IS_DEV 
          ? JSON.stringify({ emailVerificationToken: token })
          : ''
      });
    });
    
    return token;
  }

  /**
   * Mock email verification endpoint
   */
  async mockEmailVerification(validTokens: string[] = []) {
    await this.page.route('**/account/verify-email*', route => {
      const url = new URL(route.request().url());
      const token = url.searchParams.get('token');
      
      if (validTokens.includes(token || '')) {
        route.fulfill({
          status: 302,
          headers: {
            'Location': `${config.WEB_URL}/sign-in?verified=true`
          }
        });
      } else {
        route.fulfill({
          status: 400,
          contentType: 'text/html',
          body: '<html><body><h1>Error</h1><p>Token is invalid or has expired</p></body></html>'
        });
      }
    });
  }

  /**
   * Simulate clicking email verification link
   */
  async clickEmailVerificationLink(email: string): Promise<Page | null> {
    const emailData = this.findEmailByRecipient(email);
    if (!emailData || emailData.template !== 'VERIFY_EMAIL') {
      throw new Error(`No verification email found for ${email}`);
    }
    
    const verificationUrl = emailData.params.href as string;
    
    if (!verificationUrl || typeof verificationUrl !== 'string') {
      throw new Error(`Invalid verification URL in email for ${email}`);
    }
    
    // Open verification URL in new page
    const newPage = await this.page.context().newPage();
    await newPage.goto(verificationUrl);
    
    return newPage;
  }

  /**
   * Wait for email to be sent
   */
  async waitForEmail(recipient: string, timeout = 5000): Promise<EmailData> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const email = this.findEmailByRecipient(recipient);
      if (email) {
        return email;
      }
      await this.page.waitForTimeout(100);
    }
    
    throw new Error(`No email received for ${recipient} within ${timeout}ms`);
  }

  /**
   * Verify email content contains specific text
   */
  verifyEmailContent(email: EmailData, expectedContent: string[]): boolean {
    const content = JSON.stringify(email).toLowerCase();
    return expectedContent.every(text => content.includes(text.toLowerCase()));
  }

  /**
   * Get email verification link from email
   */
  getVerificationLinkFromEmail(email: EmailData): string | null {
    if (email.template === 'VERIFY_EMAIL' && email.params.href && typeof email.params.href === 'string') {
      return email.params.href;
    }
    return null;
  }
}