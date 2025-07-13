import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getWineDetailsController(req: Request, res: Response) {
  try {
    const { wineId } = req.params;

    const wine = await prisma.wine.findUnique({
      where: {
        id: wineId,
      },
      select: {
        id: true,
        name: true,
        harvest: true,
        createdAt: true,
        updatedAt: true,
        country: true,
        price: true,
        producer: true,
        size: true,
        type: true,
        WineOnConsigned: {
          select: {
            wineId: true,
            consignedId: true,
            balance: true,
            consigned: {
              select: {
                id: true,
                customer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            consigned: {
              status: "EM_ANDAMENTO",
              customer: {
                disabledAt: null,
              },
            },
          },
        },
      },
    });

    if (!wine) {
      res.status(404).json({ error: "Vinho não encontrado" });
      return;
    }

    res.status(200).json({ wine });
    return;
  } catch (error) {
    console.error("Error in getWineDetailsController:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}
