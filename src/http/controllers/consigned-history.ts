import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function consignedHistoryController(req: Request, res: Response) {
  try {
    const { customerId } = req.params;

    const consignedByCustomerId = await prisma.consigned.findMany({
      where: {
        customerId,
        customer: {
          disabledAt: null,
        },
      },
      select: {
        id: true,
        createdAt: true,
        completedIn: true,
        status: true,
        winesOnConsigned: {
          select: {
            balance: true,
            count: true,
            wines: {
              select: {
                id: true,
                name: true,
                price: true,
                country: true,
                size: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.send({ consignedByCustomerId });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
