import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getUserController(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        id: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            Consigned: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).send({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.flatMap((role) => ({
          id: role.role.id,
          name: role.role.name,
        })),
        customer: user.customer,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Erro interno do servidor" });
    return;
  }
}
