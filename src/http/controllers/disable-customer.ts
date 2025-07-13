import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function disableCustomerController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findFirst({
      where: {
        AND: [{ id }, { disabledAt: null }],
      },
    });

    if (!customer) {
      res.status(404).json({ message: "Cliente não encontrado" });
      return;
    }

    await prisma.customer.update({
      where: {
        id,
      },
      data: {
        disabledAt: new Date(),
      },
    });

    res.status(204).send({ message: "Cliente excluído com sucesso" });
  } catch (error) {
    console.error("Error disabling customer controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
}
