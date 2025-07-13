import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listConsignedController(req: Request, res: Response) {
  try {
    const { search } = req.query;

    const consignedList = await prisma.consigned.findMany({
      where: {
        status: "EM_ANDAMENTO",
        customer: {
          name: {
            contains: search as string,
            mode: "insensitive",
          },
          disabledAt: null,
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        winesOnConsigned: {
          select: {
            balance: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const resultWithBalance = consignedList.map(
      ({ winesOnConsigned, ...rest }) => {
        const totalBalance = winesOnConsigned.reduce(
          (sum, item) => sum + item.balance,
          0
        );
        return {
          ...rest,
          totalBalance,
        };
      }
    );

    res.status(200).json({ consigned: resultWithBalance });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}
