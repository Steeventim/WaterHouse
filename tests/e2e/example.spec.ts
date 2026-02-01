import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    // Be tolerant: accept common dev title or 'Home'
    await expect(page).toHaveTitle(/Vite|Home/i);
  });

  test('should create user and login via OTP/PIN', async ({ request, userFactory }) => {
    // 1. Créer un utilisateur
    const user = await userFactory.createUser();
    const phoneNumber = user.phoneNumber || user.email || `+2250000${Math.floor(Math.random()*1000000)}`;
    // 2. Envoyer un OTP
    const sendOtpRes = await request.post('/api/auth/send-otp', { data: { phoneNumber } });
    expect(sendOtpRes.ok()).toBeTruthy();
    const { otp, requestId } = await sendOtpRes.json();
    // 3. Vérifier l'OTP
    const verifyRes = await request.post('/api/auth/verify-otp', { data: { phoneNumber, otp, requestId } });
    expect(verifyRes.ok()).toBeTruthy();
    const { user: authUser } = await verifyRes.json();
    // 4. Définir un PIN
    const pin = '123456';
    const setupPinRes = await request.post('/api/auth/setup-pin', { data: { pin }, headers: { Authorization: `Bearer ${(await verifyRes.json()).accessToken}` } });
    expect(setupPinRes.ok()).toBeTruthy();
    // 5. Login via PIN
    const loginPinRes = await request.post('/api/auth/login-pin', { data: { userId: authUser.id, pin } });
    expect(loginPinRes.ok()).toBeTruthy();
    const { accessToken } = await loginPinRes.json();
    expect(accessToken).toBeTruthy();
  });
});
