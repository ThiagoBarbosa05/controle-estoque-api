import { z } from "zod";

export const updateWineBalanceSchema = z.object({
  consignedId: z.string({ message: "É preciso informar o consignado" }),
  wineId: z.string({ message: "É preciso informar o vinho" }),
  balance: z.coerce.number().default(0),
});
