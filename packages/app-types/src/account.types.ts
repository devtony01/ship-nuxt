import { z } from 'zod';
import { 
  signInSchema, 
  signUpSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  resendEmailSchema,
  verifyEmailSchema 
} from '@ship-nuxt/schemas';

export type SignInParams = z.infer<typeof signInSchema>;
export type SignUpParams = z.infer<typeof signUpSchema>;
export type ForgotPasswordParams = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordParams = z.infer<typeof resetPasswordSchema>;
export type ResendEmailParams = z.infer<typeof resendEmailSchema>;
export type VerifyEmailParams = z.infer<typeof verifyEmailSchema>;