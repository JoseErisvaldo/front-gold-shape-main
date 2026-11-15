import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da loja."),
  slug: z.string().trim().min(1, "Informe o slug."),
  whatsapp: z.string().trim().min(1, "Informe o WhatsApp."),
  imageUrl: z.string().trim().url("Informe uma URL válida para a imagem.").max(2048).nullable(),
});

export const storeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  whatsapp: z.string(),
  imageUrl: z.string().nullable(),
  active: z.boolean(),
  originCep: z.string().nullable().optional(),
  originStreet: z.string().nullable().optional(),
  originNumber: z.string().nullable().optional(),
  originComplement: z.string().nullable().optional(),
  originNeighborhood: z.string().nullable().optional(),
  originCity: z.string().nullable().optional(),
  originState: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const storeOriginAddressSchema = z.object({
  originCep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),
  originStreet: z.string().trim().min(1, "Informe a rua ou avenida.").max(200),
  originNumber: z.string().trim().min(1, "Informe o número.").max(30),
  originComplement: z.string().trim().max(120).optional(),
  originNeighborhood: z.string().trim().min(1, "Informe o bairro.").max(120),
  originCity: z.string().trim().min(1, "Informe a cidade.").max(120),
  originState: z.string().trim().length(2, "Informe a UF com 2 letras."),
});

export const updateStoreProfileSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da loja.").max(150),
  imageUrl: z
    .string()
    .trim()
    .url("Informe uma URL válida para a imagem.")
    .max(2048)
    .nullable(),
});

export const storesSchema = z.union([
  z.array(storeSchema),
  storeSchema.transform((store) => [store]),
]);
