import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../../lib/prisma";
import { updateWineBalanceSchema } from "../schemas/update-wine-balance-schema";

export async function updateWineBalanceController(req: Request, res: Response) {
  try {
    const { balance, consignedId, wineId } = updateWineBalanceSchema.parse(
      req.body
    );

    const wineBalanceToUpdate = await prisma.wineOnConsigned.findUnique({
      where: {
        consignedId_wineId: {
          wineId,
          consignedId,
        },
      },
    });

    if (!wineBalanceToUpdate) {
      res.status(404).send({ message: "Vinho não encontrado na consignado" });
      return;
    }

    await prisma.wineOnConsigned.update({
      where: {
        consignedId_wineId: {
          wineId,
          consignedId,
        },
      },
      data: {
        balance,
        count: balance,
        consigned: {
          update: {
            updatedAt: new Date(),
          },
        },
      },
    });

    res.status(200).send({ message: "Vinho atualizado com sucesso" });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
      return;
    }

    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
