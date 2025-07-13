import { z } from "zod";

export const createWineSchema = z.object({
  name: z.string().min(1, { message: "Insira o nome do vinho" }),
  harvest: z.number().optional(),
  type: z.string().min(1, { message: "Insira o tipo do vinho" }),
  price: z.number().min(1, { message: "Insira o preço do vinho" }),
  producer: z.string().optional(),
  country: z.string().optional(),
  size: z.string().min(1, { message: "Insira o tamanho do vinho" }),
});

export type CreateWineSchema = z.infer<typeof createWineSchema>;
