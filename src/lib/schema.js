import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be under 50 characters"),
  type: z.enum(["CURRENT", "SAVINGS"], {
    required_error: "Select an account type",
  }),
  balance: z
    .string()
    .min(1, "Initial balance is required")
    .refine((v) => !Number.isNaN(Number(v)), "Balance must be a number"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => !Number.isNaN(Number(v)), "Amount must be a number")
      .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
    description: z
      .string()
      .max(200, "Description must be under 200 characters")
      .optional(),
    date: z
      .date({ required_error: "Date is required" })
      .max(new Date(), "Date cannot be in the future"),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });
