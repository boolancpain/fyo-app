import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const config = await prisma.config.findUnique({
            where: { id: 'lock_password' },
        });

        console.log('DB Config Check:', config ? 'Found' : 'Not Found');

        if (!config) {
            return NextResponse.json({ success: false });
        }

        const isValid = await bcrypt.compare(password, config.value);
        console.log('Password Verification:', isValid);
        return NextResponse.json({ success: isValid });

    } catch (error) {
        console.error('Failed to verify password:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
