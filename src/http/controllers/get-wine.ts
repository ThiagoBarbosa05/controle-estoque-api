import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getWine(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const wine = await prisma.wine.findUnique({
      where: {
        id,
      },
    });

    if (!wine) {
      res.status(404).send({ message: "Vinho não encontrado" });
      return;
    }

    res.status(200).send({ wine });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
