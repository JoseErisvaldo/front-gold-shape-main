import { z } from "zod";

export const loginResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["ADMIN", "MODERADOR", "USUARIO"]),
    token: z.string().min(1),
  })
  .passthrough();
