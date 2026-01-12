import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

const url = process.env.DATABASE_URL || '';
const maskedUrl = url.replace(/:[^:@]*@/, ':****@');
console.log('Initializing Prisma with URL:', maskedUrl);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
