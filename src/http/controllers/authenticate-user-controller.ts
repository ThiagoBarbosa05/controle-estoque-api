import { Request, Response } from "express";
import { authenticateUserSchema } from "../schemas/authenticate-user-schema";
import { ZodError } from "zod";
import { prisma } from "../../lib/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

export async function authenticateUserController(req: Request, res: Response) {
  try {
    const { email, password } = authenticateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        password: true,
        id: true,
        email: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: {
                    permission: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            Consigned: {
              select: {
                id: true,
              },
              where: {
                status: "EM_ANDAMENTO",
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(401).send({ message: "email/senha inválidos" });
      return;
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).send({ message: "email/senha inválidos" });
      return;
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        roles: user.roles.flatMap((role) => role.role.name),
        permissions: user.roles.flatMap((role) =>
          role.role.permissions.map((permission) => permission.permission.name)
        ),
        consigned: user.customer?.Consigned[0]
          ? user.customer.Consigned[0].id
          : null,
        customerId: user.customer?.id || null,
      },
      process.env.JWT_SECRET!
    );

    res.status(200).send({ accessToken });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
    }

    console.error("Erro no /authenticate:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
