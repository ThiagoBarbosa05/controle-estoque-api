import { Request, Response } from "express";
import { ZodError } from "zod";
import { createConsignedSchema } from "../schemas/create-consigned-shema";
import { prisma } from "../../lib/prisma";

export async function createConsignedController(req: Request, res: Response) {
  try {
    const newConsigned = createConsignedSchema.parse(req.body);

    const createdConsigned = await prisma.consigned.create({
      data: {
        customerId: newConsigned.customerId,
        winesOnConsigned: {
          createMany: {
            data: newConsigned.wines.map((wine) => ({
              wineId: wine.id,
              balance: wine.quantity,
              count: wine.quantity,
            })),
          },
        },
      },
    });

    res.status(201).send({ consigned: createdConsigned });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
      return;
    }

    console.log(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }
}
