import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'auth.login.phoneRequired')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  password: z
    .string()
    .min(1, 'auth.login.passwordRequired')
    .min(6, 'Password must be at least 6 characters'),
});

// Register validation schema
export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'auth.register.firstNameRequired')
    .min(2, 'First name must be at least 2 characters'),
  last_name: z
    .string()
    .min(1, 'auth.register.lastNameRequired')
    .min(2, 'Last name must be at least 2 characters'),
  phone: z
    .string()
    .min(1, 'auth.register.phoneRequired')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  password: z
    .string()
    .min(1, 'auth.register.passwordRequired')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirmation: z
    .string()
    .min(1, 'auth.register.confirmPasswordRequired'),
  avatar: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'auth.register.passwordsNotMatch',
  path: ['password_confirmation'],
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, 'auth.forgotPassword.phoneRequired')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

// OTP verification validation schema
export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'auth.verifyOtp.phoneRequired')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  otp: z
    .string()
    .min(1, 'auth.verifyOtp.otpRequired')
    .length(4, 'OTP must be 4 digits'),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'auth.resetPassword.passwordRequired')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirmation: z
    .string()
    .min(1, 'auth.resetPassword.confirmPasswordRequired'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'auth.resetPassword.passwordsNotMatch',
  path: ['password_confirmation'],
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
