import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getConsignedController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const consigned = await prisma.consigned.findUnique({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        winesOnConsigned: {
          orderBy: {
            balance: "asc",
          },
          select: {
            consignedId: true,
            wineId: true,
            balance: true,
            count: true,
            wines: {
              select: {
                id: true,
                name: true,
                price: true,
                type: true,
                country: true,
                size: true,
              },
            },
          },
        },
      },
      where: {
        id,
        status: "EM_ANDAMENTO",
      },
    });

    if (!consigned) {
      res.status(404).send({ message: "Consignado não encontrado" });
      return;
    }

    res.status(200).send({ consigned });

    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
}
