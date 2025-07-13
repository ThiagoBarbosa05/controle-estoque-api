import { Request, Response } from "express";
import { ZodError } from "zod";
import { updateUserSchema } from "../schemas/update-use-schema";
import { prisma } from "../../lib/prisma";
import { hash } from "bcryptjs";

export async function updateUserController(req: Request, res: Response) {
  try {
    const data = updateUserSchema.parse(req.body);

    const { id: userId } = req.params;

    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [{ id: { not: userId } }, { email: data.email }],
      },
    });

    if (existingUser) {
      res.status(409).send({ message: "Já existe um usuário com esse email" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).send({ message: "Usuário não encontrado" });
      return;
    }
    let newPasswordHashed: string | null = null;

    if (data.newPassword) {
      newPasswordHashed = await hash(data.newPassword, 6);
    }

    const userUpdated = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name,
        email: data.email,
        password: newPasswordHashed ?? user.password,
        associatedCustomerId: data.associatedCustomerId ?? null,
      },
    });

    await prisma.userRole.deleteMany({
      where: {
        userId,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: userUpdated.id,
        roleId: data.roleId,
      },
    });

    res.status(200).send({ userId: userUpdated.id });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
      return;
    }

    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
