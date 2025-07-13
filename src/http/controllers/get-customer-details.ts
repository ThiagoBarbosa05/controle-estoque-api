import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getCustomerDetailsController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: {
        AND: [{ id }, { disabledAt: null }],
      },
      include: {
        address: true,
      },
    });

    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.send({ customer });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}
