import { PrismaClient} from '@prisma/client';

export const prismaService = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});
