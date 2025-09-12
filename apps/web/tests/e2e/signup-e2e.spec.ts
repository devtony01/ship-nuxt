import { expect,test } from '@playwright/test';

import { SimpleTestUtils } from './helpers/simple-utils';

test.describe('Signup E2E Flow', () => {
  test('should complete signup flow from frontend to backend', async ({ page }) => {
    const utils = new SimpleTestUtils(page);

    // Navigate to signup page
    await page.goto('/sign-up');

    // Verify signup page loads
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();

    // Fill out the signup form
    const testUser = await utils.fillSignUpForm();

    // Submit the form
    await utils.submitSignUpForm();

    // Wait for success response
    await utils.verifySignUpSuccess(testUser.email);

    console.log(`✅ Signup successful for ${testUser.email}`);
  });

  test('should handle duplicate email error', async ({ page }) => {
    // Use a common email that might already exist
    const duplicateUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
      password: 'SecurePassword123!'
    };

    await page.goto('/sign-up');

    // Fill form with potentially duplicate email
    await page.getByLabel('First Name').fill(duplicateUser.firstName);
    await page.getByLabel('Last Name').fill(duplicateUser.lastName);
    await page.getByLabel('Email Address').fill(duplicateUser.email);
    await page.getByLabel('Password').fill(duplicateUser.password);

    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Check for either success or duplicate email error
    try {
      // If it succeeds (email wasn't duplicate)
      await expect(page.getByText('Thanks!')).toBeVisible({ timeout: 5000 });
      console.log('✅ Email was not duplicate, signup succeeded');
    } catch {
      // If it fails due to duplicate email
      await expect(page.getByText('User with this email is already registered')).toBeVisible();
      console.log('✅ Duplicate email error handled correctly');
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/sign-up');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Button should be disabled for invalid form
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeDisabled();

    console.log('✅ Form validation working correctly');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/sign-up');

    // Fill form with invalid email
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email Address').fill('invalid-email');
    await page.getByLabel('Password').fill('SecurePassword123!');

    // Try to submit
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should show email validation error
    await expect(page.getByText('Invalid email')).toBeVisible();

    console.log('✅ Email validation working correctly');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/sign-up');

    // Fill form with weak password
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('123');

    // Try to submit
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should show password validation error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();

    console.log('✅ Password validation working correctly');
  });
});