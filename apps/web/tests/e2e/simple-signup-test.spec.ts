import { expect,test } from '@playwright/test';

test.describe('Simple Signup Test', () => {
  test('should load signup page', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/sign-up');

    // Take a screenshot to see what's happening
    await page.screenshot({ path: 'test-results/signup-page.png' });

    // Check if the page loads
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
    
    console.log('✅ Signup page loads correctly');
  });

  test('should fill and submit form', async ({ page }) => {
    await page.goto('/sign-up');

    // Fill the form
    const testEmail = `test-${Date.now()}@example.com`;
    
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill('SecurePassword123!');

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/form-filled.png' });

    // Check if submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Sign Up' });
    await expect(submitButton).toBeEnabled();

    // Submit the form
    await submitButton.click();

    // Wait a bit and take screenshot
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/after-submit.png' });

    // Check what's on the page
    const pageContent = await page.content();
    console.log('Page content after submit:', pageContent.substring(0, 500));

    // Try to find any success indicators
    const hasThankYou = await page.getByText('Thanks!').isVisible().catch(() => false);
    const hasError = await page.locator('.text-error').isVisible().catch(() => false);
    const hasLoading = await page.locator('.loading').isVisible().catch(() => false);

    console.log('Success message visible:', hasThankYou);
    console.log('Error message visible:', hasError);
    console.log('Loading indicator visible:', hasLoading);

    if (hasThankYou) {
      console.log('✅ Signup successful!');
    } else if (hasError) {
      const errorText = await page.locator('.text-error').textContent();
      console.log('❌ Error occurred:', errorText);
    } else {
      console.log('❓ Unknown state after submit');
    }
  });
});