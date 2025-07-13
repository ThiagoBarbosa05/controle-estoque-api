import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { prisma } from "../../lib/prisma";

const addWinesOnConsignedSchema = z.object({
  consignedId: z.string({
    message: "É preciso informar o consignado para adicionar os vinhos",
  }),
  wines: z.array(
    z.object({
      wineId: z.string({ message: "É preciso informar o id do vinho" }),
      quantity: z.number().default(1),
    })
  ),
});

export async function addWinesOnConsignedController(
  req: Request,
  res: Response
) {
  try {
    const newWinesOnConsigned = addWinesOnConsignedSchema.parse(req.body);

    const consigned = await prisma.consigned.findUnique({
      where: {
        id: newWinesOnConsigned.consignedId,
        status: "EM_ANDAMENTO",
      },

      include: {
        winesOnConsigned: true,
      },
    });

    if (!consigned) {
      res.status(404).send({ message: "Consignado não encontrado" });
      return;
    }

    await prisma.$transaction(
      newWinesOnConsigned.wines.map((wine) =>
        prisma.wineOnConsigned.upsert({
          where: {
            consignedId_wineId: {
              consignedId: newWinesOnConsigned.consignedId,
              wineId: wine.wineId,
            },
          },
          update: {
            consigned: {
              update: {
                updatedAt: new Date(),
              },
            },
          },
          create: {
            consignedId: newWinesOnConsigned.consignedId,
            wineId: wine.wineId,
            balance: wine.quantity,
            count: wine.quantity,
          },
        })
      )
    );

    res.send();
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
