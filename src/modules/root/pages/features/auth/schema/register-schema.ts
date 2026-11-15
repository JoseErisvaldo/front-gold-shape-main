import { registerRequestSchema } from "./register-request-schema";

export const registerSchema = registerRequestSchema
  .extend({
    confirmPassword: registerRequestSchema.shape.password,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });
