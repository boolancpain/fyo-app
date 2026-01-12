import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

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

        // Fetch the app first to get the icon URL
        const app = await prisma.app.findUnique({
            where: { id },
            select: { icon: true },
        });

        // If the icon is a Vercel Blob URL, delete it
        if (app?.icon && (app.icon.includes('public.blob.vercel-storage.com') || app.icon.includes('blob.vercel'))) {
            try {
                await del(app.icon);
                console.log('Deleted blob:', app.icon);
            } catch (blobError) {
                // Log the error but don't block the app deletion
                console.error('Failed to delete blob:', blobError);
            }
        }

        await prisma.app.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete app:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
