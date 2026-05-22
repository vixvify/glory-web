import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]),
});

export const registerUserSchema = userSchema.pick({
  name: true,
  email: true,
  password: true,
});

export const loginUserSchema = userSchema.pick({
  email: true,
  password: true,
});
