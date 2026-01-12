import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const apps = await prisma.app.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });
        return NextResponse.json(apps);
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, launchUrl, icon, gridRow, gridCol } = body;

        const newApp = await prisma.app.create({
            data: {
                name,
                launchUrl,
                icon,
                gridRow: gridRow || 1,
                gridCol: gridCol || 1,
            },
        });

        return NextResponse.json(newApp);
    } catch (error) {
        console.error('Failed to create app:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
