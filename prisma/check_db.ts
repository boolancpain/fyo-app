import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database connection...');

    // Check Config
    const config = await prisma.config.findUnique({
        where: { id: 'lock_password' },
    });
    console.log('Config found:', config);

    if (config) {
        console.log('Config value:', config.value);
    } else {
        console.log('No lock_password config found in DB!');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
