import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listWinesController(req: Request, res: Response) {
  const { search } = req.query;

  console.log(search);

  try {
    const wines = await prisma.wine.findMany({
      where: {
        name: {
          contains: search as string,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    res.status(200).send({ wines: wines });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
}
