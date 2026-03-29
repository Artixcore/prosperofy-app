import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
  device_name: z.string().max(255).optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required.").max(255),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Use at least 8 characters."),
    password_confirmation: z.string().min(1, "Confirm your password."),
    device_name: z.string().max(255).optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
