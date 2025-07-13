import { Request, Response } from "express";
import { ZodError } from "zod";
import { createCustomerSchema } from "../schemas/create-customer-schema";
import { prisma } from "../../lib/prisma";


export async function createCustomerController(req: Request, res: Response) {
  try {
    const newCustomer = createCustomerSchema.parse(req.body);
    

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { document: newCustomer.document },
          { email: newCustomer.email },
          { stateRegistration: newCustomer.stateRegistration },
        ],
      },
    });

    if (existingCustomer) {
      res.status(409).send({
        message: `
        Dados já cadastrados para outro cliente: ${existingCustomer.email === newCustomer.email ? "email: " + existingCustomer.email : ""} =>
        ${existingCustomer.document === newCustomer.document ? "CNPJ: " + existingCustomer.document : ""} =>
        ${existingCustomer.stateRegistration === newCustomer.stateRegistration ? "ie: " + existingCustomer.stateRegistration : ""}
        `,
      });
      return;
    }

    const newCustomerSaved = await prisma.customer.create({
      data: {
        name: newCustomer.name,
        document: newCustomer.document,
        businessPhone: newCustomer.businessPhone,
        cellphone: newCustomer.cellphone,
        contactPerson: newCustomer.contactPerson,
        stateRegistration: newCustomer.stateRegistration,
        email: newCustomer.email,
      },
    });

    if (newCustomer.address) {
      const allFieldsEmpty = Object.values(newCustomer.address || {}).every(
        (value) => value.trim() === ""
      );
      if (!allFieldsEmpty) {
        await prisma.address.create({
          data: {
            customerId: newCustomerSaved.id,
            city: newCustomer.address.city,
            state: newCustomer.address.state,
            streetAddress: newCustomer.address.streetAddress,
            number: newCustomer.address.number,
            zipCode: newCustomer.address.zipCode,
            neighborhood: newCustomer.address.neighborhood,
          },
        });
      }

      console.log(allFieldsEmpty);
    }

    res.status(201).send({ customerId: newCustomerSaved.id });
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
