import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const apps = [
        {
            name: 'Google',
            launchUrl: 'https://www.google.com/search?igu=1',
            icon: 'search',
            gridRow: 1,
            gridCol: 1,
        },
        {
            name: 'VS Code',
            launchUrl: 'https://vscode.dev',
            icon: 'monitor',
            gridRow: 2,
            gridCol: 1,
        },
        {
            name: 'GitHub',
            launchUrl: 'https://github.com',
            icon: 'github',
            gridRow: 3,
            gridCol: 1,
        },
    ];

    console.log('Seeding initial apps...');

    for (const app of apps) {
        await prisma.app.upsert({
            where: { id: app.name },
            update: {},
            create: {
                ...app,
                id: crypto.randomUUID(),
            },
        });
    }

    console.log('Seeding configurations...');
    const hashedPassword = bcrypt.hashSync('1234', 10);

    const configs = [
        { id: 'lock_password', value: hashedPassword },
        { id: 'wallpaper', value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
    ];

    for (const config of configs) {
        await prisma.config.upsert({
            where: { id: config.id },
            update: { value: config.value },
            create: config,
        });
    }

    console.log('Seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
