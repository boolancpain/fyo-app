import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const config = await prisma.config.findUnique({
        where: { id: 'lock_password' },
    });

    if (config) {
        const isMatch = await bcrypt.compare('1234', config.value);
        console.log(`Is stored hash match '1234'? ${isMatch}`);
    } else {
        console.log('Config not found');
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
