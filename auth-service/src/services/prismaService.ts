import { PrismaClient } from '@prisma/client';

export class  PrismaService extends PrismaClient{
    constructor(){
        super({
            log: ['query', 'info', 'warn', 'error'],
            errorFormat: 'pretty',
        })
    }
}

export const prismaService = new PrismaService();