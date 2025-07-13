import { Customer, Prisma, PrismaClient } from "../../generated/prisma";
import { prisma } from "../../lib/prisma";
import { CreateCustomerInput } from "../../use-cases/customer/create-customer";

type ExistingCustomerInput = {
  document?: string;
  email?: string;
  stateRegistration?: string;
};

export class CustomerRepository {
  private _client: PrismaClient = prisma;

  async existingCustomer(
    input: ExistingCustomerInput
  ): Promise<Customer | null> {
    const customer = await this._client.customer.findFirst({
      where: {
        OR: [
          { document: input.document },
          { email: input.email },
          { stateRegistration: input.stateRegistration },
        ],
      },
    });

    if (!customer) {
      return null;
    }

    return customer;
  }

  async createCustomer(customer: CreateCustomerInput): Promise<Customer> {
    const newCustomer = await this._client.customer.create({
      data: {
        name: customer.name,
        contactPerson: customer.contactPerson,
        document: customer.document,
        stateRegistration: customer.stateRegistration,
        email: customer.email,
        cellphone: customer.cellphone,
        businessPhone: customer.businessPhone,
        address: {
          create: {
            city: customer.address?.city,
            state: customer.address?.state,
            streetAddress: customer.address?.streetAddress,
            number: customer.address?.number,
            zipCode: customer.address?.zipCode,
            neighborhood: customer.address?.neighborhood,
          },
        },
      },
    });

    return newCustomer;
  }

  async findManyCustomers(searchTerm?: string) {
    const customers = await this._client.customer.findMany({
      select: {
        id: true,
        name: true,
        contactPerson: true,
        email: true,
        cellphone: true,
        businessPhone: true,
      },
      where: {
        AND: [
          { disabledAt: null },
          {
            name: {
              contains: searchTerm as string,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return customers;
  }
}
