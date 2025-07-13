import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { updateWineSchema } from "../schemas/update-wine-schema";
import { prisma } from "../../lib/prisma";

export async function updateWineController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const wineSchema = updateWineSchema.parse(req.body);

    const priceInCents = wineSchema.price * 100;

    const wine = await prisma.wine.findUnique({
      select: {
        id: true,
      },
      where: {
        id,
      },
    });

    if (!wine) {
      res.status(404).send({ message: "Vinho não encontrado" });
      return;
    }

    const updatedWine = await prisma.wine.update({
      where: {
        id,
      },
      data: {
        ...wineSchema,
        price: priceInCents,
      },
    });

    res.status(200).send({
      wine: {
        id: updatedWine.id,
      },
    });

    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send({ errors: error.flatten().fieldErrors });
      return;
    }
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
