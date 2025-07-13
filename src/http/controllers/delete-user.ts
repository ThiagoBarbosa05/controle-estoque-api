import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function deleteUserController(req: Request, res: Response) {
  try {
    const { id: userId } = req.params;

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(204).send();
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
