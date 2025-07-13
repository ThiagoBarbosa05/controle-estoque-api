import { PrismaClient, ConsignedStatus } from '../src/generated/prisma';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  await prisma.address.deleteMany({})
  await prisma.customer.deleteMany({})
  const customers = await prisma.customer.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      name: faker.company.name(),
      email: faker.internet.email(),
      document: faker.string.numeric(14),
      contactPerson: faker.person.fullName(),
      cellphone: faker.phone.number(),
      businessPhone: faker.phone.number(),
      stateRegistration: faker.string.numeric(9),
      createdAt: faker.date.past({ refDate: new Date('2025-06-01') }),
    }))
  })


  const winesOnDatabase = await prisma.wine.findMany({})
  const customersOnDatabase = await prisma.customer.findMany({})
  for (const customer of customersOnDatabase) {
    await prisma.address.create({
      data: {
        customerId: customer.id,
        city: faker.location.city(),
        state: faker.location.state(),
        number: faker.location.buildingNumber(),
        streetAddress: faker.location.streetAddress(),
        zipCode: faker.location.zipCode(),
        neighborhood: faker.location.street(),
      }
    })

    await prisma.consigned.create({
      data: {
        customerId: customer.id,
        status: "EM_ANDAMENTO",
        createdAt: faker.date.past({ refDate: new Date('2025-06-01') }),
        winesOnConsigned: {
          createMany: {
            data: winesOnDatabase.map(wine => ({
              wineId: wine.id,
              balance: faker.number.int({ min: 1, max: 50 }),
            }))
          }
        }
      }
    })
  }


}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
