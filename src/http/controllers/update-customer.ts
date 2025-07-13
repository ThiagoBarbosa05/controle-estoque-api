import { Request, Response } from "express";
import { ZodError } from "zod";
import { updateCustomerSchema } from "../schemas/update-customer-schema";
import { prisma } from "../../lib/prisma";

export async function updateCustomerController(req: Request, res: Response) {
  try {
    const customerSchema = updateCustomerSchema.parse(req.body);

    const { id: customerId } = req.params;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        AND: [
          { id: { not: customerId } },
          {
            OR: [
              { document: customerSchema.document },
              { email: customerSchema.email },
              { stateRegistration: customerSchema.stateRegistration },
            ],
          },
        ],
      },
    });

    if (existingCustomer) {
      res.status(409).send({
        message: `Já existe um cliente com os dados informados 
        ${existingCustomer.email === customerSchema.email ? "email: " + existingCustomer.email : ""} ->
        ${existingCustomer.document === customerSchema.document ? "CNPJ: " + existingCustomer.document : ""} ->
        ${existingCustomer.stateRegistration === customerSchema.stateRegistration ? "ie: " + existingCustomer.stateRegistration : ""}
        `,
      });
      return;
    }

    const customer = await prisma.customer.findFirst({
      where: {
        AND: [{ id: customerId }, { disabledAt: null }],
      },
    });

    if (!customer) {
      res.status(404).send({ message: "Cliente não encontrado" });
      return;
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name: customerSchema.name,
        document: customerSchema.document,
        businessPhone: customerSchema.businessPhone,
        cellphone: customerSchema.cellphone,
        contactPerson: customerSchema.contactPerson,
        stateRegistration: customerSchema.stateRegistration,
        email: customerSchema.email,
        address: {
          update: {
            city: customerSchema.address!.city,
            state: customerSchema.address!.state,
            streetAddress: customerSchema.address!.streetAddress,
            number: customerSchema.address!.number,
            zipCode: customerSchema.address!.zipCode,
            neighborhood: customerSchema.address!.neighborhood,
          },
        },
      },
    });

    res.status(200).send({ customerId: updatedCustomer.id });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.flatten().fieldErrors });
      return;
    }
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
