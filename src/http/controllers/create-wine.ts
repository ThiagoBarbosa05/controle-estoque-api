import { Request, Response } from "express";
import { ZodError } from "zod";
import { createWineSchema } from "../schemas/create-wine-schema";
import { prisma } from "../../lib/prisma";

export async function createWineController(req: Request, res: Response) {
  try {
    const newWine = createWineSchema.parse(req.body);

    const priceInCents = newWine.price * 100;

    const wine = await prisma.wine.create({
      data: {
        name: newWine.name,
        price: priceInCents,
        size: newWine.size,
        country: newWine.country,
        type: newWine.type,
        harvest: newWine.harvest,
        producer: newWine.producer,
      },
    });

    res.status(201).send({ wineId: wine.id });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
      return;
    }

    console.error(error);

    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
