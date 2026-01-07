import * as z from "zod";

export const SettingsSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be required",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be required",
  }),
  email: z.optional(z.string().email()),
  image: z.optional(z.string()),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email must be required",
  }),
});

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Password must be required",
  }),
  code: z.optional(
    z.string().min(6, {
      message: "Two Factor code must be at least 6 characters",
    })
  ),
});

export const SignUpSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be required",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be required",
  }),
  email: z.email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  code: z.optional(
    z.string().min(6, {
      message: "Verification code must be at least 6 characters",
    })
  ),
});
