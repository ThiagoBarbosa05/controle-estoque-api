import { z } from "zod";

export const countWineSchema = z.object({
  customerId: z.string({ message: "Id do cliente é obrigatório" }),
  counts: z.array(
    z.object({
      wineId: z.string({ message: "Id do vinho é obrigatório" }),
      quantity: z.coerce.number(),
    })
  ),
});
