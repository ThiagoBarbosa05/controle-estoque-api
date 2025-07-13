import { Address, Prisma, PrismaClient } from "../../generated/prisma";
import { prisma } from "../../lib/prisma";

export class AddressRepository {
  private _client: PrismaClient = prisma;

  async createAddress(data: Address): Promise<Address> {
    const newAddress = await this._client.address.create({
      data,
    });

    return newAddress;
  }
}
