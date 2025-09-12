import { expect,test } from '@playwright/test';

test.describe('UI Only Signup Test', () => {
  test('should load and interact with signup form', async ({ page }) => {
    // Mock the API to avoid backend issues
    await page.route('**/account/sign-up', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ emailVerificationToken: 'test-token-123' })
      });
    });

    // Navigate to signup page
    await page.goto('/sign-up');

    // Verify page loads
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
    console.log('✅ Signup page loads');

    // Fill the form
    const testEmail = `test-${Date.now()}@example.com`;
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill('SecurePassword123!');
    console.log('✅ Form filled successfully');

    // Check submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Sign Up' });
    await expect(submitButton).toBeEnabled();
    console.log('✅ Submit button is enabled');

    // Submit the form
    await submitButton.click();

    // Wait for success message
    await expect(page.getByText('Thanks!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Please follow the instructions from the email')).toBeVisible();
    await expect(page.getByText(testEmail)).toBeVisible();
    console.log('✅ Success message displayed');

    // Check for development verification link
    const verifyLink = page.getByRole('link', { name: 'Verify email' });
    if (await verifyLink.isVisible()) {
      console.log('✅ Development verification link is visible');
    }

    console.log('🎉 Signup UI flow completed successfully!');
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/sign-up');

    // Test empty form
    const submitButton = page.getByRole('button', { name: 'Sign Up' });
    await expect(submitButton).toBeDisabled();
    console.log('✅ Submit button disabled for empty form');

    // Test invalid email
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email Address').fill('invalid-email');
    await page.getByLabel('Password').fill('SecurePassword123!');
    
    // Button should still be disabled
    await expect(submitButton).toBeDisabled();
    console.log('✅ Submit button disabled for invalid email');

    // Fix email
    await page.getByLabel('Email Address').fill('test@example.com');
    await expect(submitButton).toBeEnabled();
    console.log('✅ Submit button enabled for valid form');

    console.log('🎉 Form validation working correctly!');
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/account/sign-up', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          clientErrors: {
            email: ['User with this email is already registered']
          }
        })
      });
    });

    await page.goto('/sign-up');

    // Fill and submit form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email Address').fill('existing@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should show error message
    await expect(page.getByText('User with this email is already registered')).toBeVisible();
    console.log('✅ Error message displayed correctly');

    console.log('🎉 Error handling working correctly!');
  });
});