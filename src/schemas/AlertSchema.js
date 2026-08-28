import { z } from "zod";

export const alertSchema = z.object({
    message: z
        .string()
        .min(1, "Headline is required.")
        .max(255, "Headline must be 255 characters or fewer."),
    instructions: z.string().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    targetRoles: z
        .array(z.enum(["student", "faculty", "staff"]))
        .min(1, "Select at least one recipient group."),
    channels: z
        .array(z.enum(["email", "web_push", "sms"]))
        .min(1, "Select at least one delivery channel."),
});