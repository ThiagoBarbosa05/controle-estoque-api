import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function deleteWineController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const wineExistsInConsigned = await prisma.wineOnConsigned.findFirst({
      where: {
        wineId: id,
      },
    });

    if (wineExistsInConsigned) {
      res.status(400).send({
        message: "Vinho não pode ser deletado, pois pertence a um consignado",
      });
      return;
    }

    await prisma.wine.delete({
      where: {
        id,
      },
    });

    res.status(204).send({ message: "Vinho deletado com sucesso" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
