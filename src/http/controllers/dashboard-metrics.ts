import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function dashboardMetricsController(req: Request, res: Response) {
  try {
    const count = await prisma.customer.count({
      where: {
        disabledAt: null,
      },
    });

    const winesQuantity = await prisma.wine.count();

    const winesOnConsigned = await prisma.wineOnConsigned.aggregate({
      where: {
        consigned: {
          status: "EM_ANDAMENTO",
          customer: {
            disabledAt: null,
          },
        },
      },
      _sum: {
        balance: true,
      },
    });

    res.send({
      count,
      winesQuantity,
      winesOnConsigned: winesOnConsigned._sum.balance,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
