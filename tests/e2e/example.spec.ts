import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    // Be tolerant: accept common dev title or 'Home'
    await expect(page).toHaveTitle(/Vite|Home/i);
  });

  test('should create user and login', async ({ page, userFactory }) => {
    const user = await userFactory.createUser();

    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
