import { z } from "zod";

export const registerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.literal("USUARIO"),
  createdAt: z.string(),
});
