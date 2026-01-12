import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const configs = await prisma.config.findMany();
        const configMap: Record<string, string> = {};
        for (const config of configs) {
            if (config.id === 'lock_password') continue;
            configMap[config.id] = config.value;
        }

        return NextResponse.json(configMap);
    } catch (error) {
        console.error('Failed to fetch configs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, value } = body;

        const updatedConfig = await prisma.config.upsert({
            where: { id },
            update: { value },
            create: { id, value },
        });

        return NextResponse.json(updatedConfig);
    } catch (error) {
        console.error('Failed to update config:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
