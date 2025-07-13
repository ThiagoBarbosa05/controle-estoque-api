import { Request, Response } from "express";
import { ZodError } from "zod";
import { createUserSchema } from "../schemas/create-user-schema";
import { prisma } from "../../lib/prisma";
import { hash } from "bcryptjs";

export async function createUserController(req: Request, res: Response) {
  try {
    const newUser = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: newUser.email,
      },
    });

    if (existingUser) {
      res.status(409).send({ message: "Já existe um usuário com esse email" });
      return;
    }

    const passwordHashed = await hash(newUser.password, 6);

    const userCreated = await prisma.user.create({
      data: {
        email: newUser.email,
        name: newUser.name,
        password: passwordHashed,
        associatedCustomerId: newUser.associatedCustomerId,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: userCreated.id,
        roleId: newUser.roleId,
      },
    });

    res.status(201).send({ userId: userCreated.id });

    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
      return;
    }

    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
