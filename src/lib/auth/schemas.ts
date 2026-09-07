import { z } from "zod";

export const signupRoles = ["tenant", "landlord", "agent"] as const;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(signupRoles),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    phone: z
      .string()
      .min(10, "Enter a valid Nigerian phone number")
      .regex(/^[+0-9\s()-]+$/, "Enter a valid phone number"),
    role: z.enum(["tenant", "landlord", "agent", "admin"]),
    companyName: z.string().optional(),
    bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.role === "landlord" || data.role === "agent") &&
      (!data.companyName || data.companyName.trim().length < 2)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Company or agency name is required for landlords and agents",
        path: ["companyName"],
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
