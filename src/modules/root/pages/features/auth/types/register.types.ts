import type { z } from "zod";
import type { registerResponseSchema } from "../schema/register-response-schema";
import type { registerSchema } from "../schema/register-schema";

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RegisteredUser = z.infer<typeof registerResponseSchema>;
