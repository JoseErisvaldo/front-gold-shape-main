import { z } from "zod";

export const registerRequestSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  email: z.string().trim().email("Informe um endereço de e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
