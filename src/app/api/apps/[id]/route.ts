import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedApp = await prisma.app.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedApp);
    } catch (error) {
        console.error('Failed to update app:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.app.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete app:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
