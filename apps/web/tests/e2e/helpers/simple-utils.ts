import { expect,Page } from '@playwright/test';

export class SimpleTestUtils {
  constructor(private page: Page) {}

  /**
   * Fill the sign-up form with test data
   */
  async fillSignUpForm(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  } = {}) {
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      ...data,
    };

    await this.page.getByLabel('First Name').fill(testData.firstName);
    await this.page.getByLabel('Last Name').fill(testData.lastName);
    await this.page.getByLabel('Email Address').fill(testData.email);
    await this.page.getByLabel('Password').fill(testData.password);

    return testData;
  }

  /**
   * Submit the sign-up form
   */
  async submitSignUpForm() {
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }

  /**
   * Verify successful sign-up
   */
  async verifySignUpSuccess(email: string) {
    await expect(this.page.getByText('Thanks!')).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText('Please follow the instructions from the email')).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
  }

  /**
   * Generate unique test email
   */
  generateTestEmail(prefix = 'test') {
    return `${prefix}-${Date.now()}@example.com`;
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}-${Date.now()}.png` });
  }
}