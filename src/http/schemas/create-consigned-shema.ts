import { z } from "zod";

export const createConsignedSchema = z.object({
  customerId: z.string({
    message: "É preciso informar o cliente para criação do consignado",
  }),
  wines: z
    .array(
      z.object({
        id: z.string({ message: "É preciso informar o id do vinho" }),
        quantity: z.coerce.number().default(1),
      })
    )
    .min(1, { message: "É preciso informar pelo menos um vinho" }),
});

export type CreateConsignedInput = z.infer<typeof createConsignedSchema>;
