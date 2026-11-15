import { z } from "zod";

export const customerAddressInputSchema = z.object({
  label: z.string().trim().min(1, "Informe um nome para o endereço.").max(60),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),
  street: z.string().trim().min(1, "Informe a rua ou avenida.").max(200),
  number: z.string().trim().min(1, "Informe o número.").max(30),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().min(1, "Informe o bairro.").max(120),
  city: z.string().trim().min(1, "Informe a cidade.").max(120),
  state: z.string().trim().length(2, "Informe a UF com 2 letras."),
});

export const customerAddressSchema = customerAddressInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const customerAddressesSchema = z.array(customerAddressSchema);

export type CustomerAddress = z.infer<typeof customerAddressSchema>;
export type CustomerAddressInput = z.infer<typeof customerAddressInputSchema>;
