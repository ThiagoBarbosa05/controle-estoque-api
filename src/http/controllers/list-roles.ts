import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listRolesController(req: Request, res: Response) {
  try {
    const roles = await prisma.role.findMany();

    res.status(200).send({ roles });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
