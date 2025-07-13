import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listCustomerSummaryController(
  req: Request,
  res: Response
) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        Consigned: {
          some: {
            id: {
              not: undefined,
            },
          },
        },
        disabledAt: null,
      },
      select: {
        id: true,
        name: true,
        Consigned: {
          where: {
            status: "EM_ANDAMENTO",
          },
          select: {
            id: true,
            winesOnConsigned: {
              select: {
                balance: true,
                wines: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const summary = customers.map((customer) => {
      const allWines = customer.Consigned.flatMap((c) => c.winesOnConsigned);
      const totalBalance = allWines.reduce(
        (sum, item) => sum + item.balance,
        0
      );

      const wineTypes = new Set(allWines.map((item) => item.wines.type));
      const totalTypes = wineTypes.size;

      return {
        customerId: customer.id,
        customer: customer.name,
        consignedId: customer.Consigned[0].id,
        totalTypes,
        totalBalance,
      };
    });

    res.status(200).send({ summary });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
