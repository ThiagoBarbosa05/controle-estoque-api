import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listUsersController(req: Request, res: Response) {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      where: {
        name: {
          contains: search as string,
          mode: "insensitive",
        },
        OR: [
          {
            customer: null, // Inclui usuários sem nenhum customer
          },
          {
            customer: {
              is: {
                disabledAt: null, // Inclui usuários com customer ativo
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).send({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        roles: user.roles.map((role) => ({
          id: role.role.id,
          name: role.role.name,
        })),
        customer: user.customer,
      })),
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
