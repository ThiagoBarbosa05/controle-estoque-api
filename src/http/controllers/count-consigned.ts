import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { countWineSchema } from "../schemas/count-wine-scheme";
import { ZodError } from "zod";

export async function countWineOnConsignedController(
  req: Request,
  res: Response
) {
  try {
    const { counts, customerId } = countWineSchema.parse(req.body);
    const { id } = req.params;

    await prisma.$transaction(
      counts.map((wine) =>
        prisma.wineOnConsigned.update({
          where: {
            consignedId_wineId: {
              consignedId: id,
              wineId: wine.wineId,
            },
          },
          data: {
            count: wine.quantity,
            consigned: {
              update: {
                completedIn: new Date(),
                status: "CONCLUÍDO",
              },
            },
          },
        })
      )
    );

    const updatedWines = await prisma.wineOnConsigned.findMany({
      where: {
        consignedId: id,
      },
      include: {
        wines: true,
        consigned: true,
      },
    });

    console.log(updatedWines);

    await prisma.consigned.create({
      data: {
        customerId: updatedWines[0].consigned.customerId,
        winesOnConsigned: {
          createMany: {
            data: updatedWines.map((wine) => ({
              balance: wine.count ?? wine.balance,
              wineId: wine.wineId,
              count: wine.count,
            })),
          },
        },
      },
    });

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
