/**
 * Service Pattern Verification Tests
 * Tests that our service patterns are working correctly after alignment with my-ship-app
 */
describe('service Pattern Verification', () => {
  describe('user Service', () => {
    it('should have user service with correct methods', async () => {
      const userService = await import('../../user/user.service');

      expect(userService.default).toBeDefined();
      expect(userService.default.findOne).toBeDefined();
      expect(userService.default.insertOne).toBeDefined();
      expect(userService.default.updateOne).toBeDefined();
      expect(userService.default.exists).toBeDefined();
      expect(userService.default.getPublic).toBeDefined();
    });
  });

  describe('token Service', () => {
    it('should have token service with correct methods', async () => {
      const tokenService = await import('../../token/token.service');

      expect(tokenService.default).toBeDefined();
      expect(tokenService.default.createToken).toBeDefined();
      expect(tokenService.default.validateToken).toBeDefined();
      expect(tokenService.default.invalidateToken).toBeDefined();
      expect(tokenService.default.invalidateUserTokens).toBeDefined();
    });
  });

  describe('email Service', () => {
    it('should have email service configured', async () => {
      const emailService = await import('../../../services/email/email.service');

      expect(emailService.default).toBeDefined();
      expect(emailService.default.sendTemplate).toBeDefined();
    });
  });

  describe('security Utils', () => {
    it('should have security utilities', async () => {
      const { securityUtil } = await import('../../../utils');

      expect(securityUtil).toBeDefined();
      expect(securityUtil.hashPassword).toBeDefined();
      expect(securityUtil.verifyPasswordHash).toBeDefined();
    });
  });

  describe('cookie Utils', () => {
    it('should have cookie utilities', async () => {
      const { cookieUtil } = await import('../../../utils');

      expect(cookieUtil).toBeDefined();
      expect(cookieUtil.setTokens).toBeDefined();
      expect(cookieUtil.unsetTokens).toBeDefined();
    });
  });

  describe('constants', () => {
    it('should have required constants', async () => {
      const constants = await import('@ship-nuxt/app-constants');

      expect(constants.ACCESS_TOKEN).toBeDefined();
      expect(constants.EMAIL_VERIFICATION_TOKEN).toBeDefined();
      expect(constants.RESET_PASSWORD_TOKEN).toBeDefined();
      expect(constants.COOKIES).toBeDefined();
    });
  });

  describe('types', () => {
    it('should have required types', async () => {
      const types = await import('../../../types');

      expect(types.Template).toBeDefined();
      expect(types.TokenType).toBeDefined();
    });
  });

  describe('error Handling', () => {
    it('should have error handling middleware', async () => {
      const middleware = await import('../../../routes/middlewares/attach-custom-errors.middleware');

      expect(middleware.default).toBeDefined();
      expect(typeof middleware.default).toBe('function');
    });
  });
});
