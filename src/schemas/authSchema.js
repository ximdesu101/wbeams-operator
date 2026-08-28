import { z } from "zod";

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

export const ForgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
});

export const passwordFieldSchema = z
    .string()
    .min(8, "Password must be at least 8 characters");

export const passwordConfirmFieldSchema = z
    .string()
    .min(1, "Please confirm your password");

export const ActivateAccountSchema = z
    .object({
        password: passwordFieldSchema,
        password_confirmation: passwordConfirmFieldSchema,
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

export const ResetPasswordSchema = z
    .object({
        password: passwordFieldSchema,
        password_confirmation: passwordConfirmFieldSchema,
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });