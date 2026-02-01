import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get('carId');

    if (!carId) {
        return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetUrl = `${baseUrl}/scan/${carId}`;

    try {
        const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            }
        });

        return NextResponse.json({ qrImage: qrCodeDataUrl, url: targetUrl });
    } catch (err) {
        console.error('QR Generation Error:', err);
        return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
    }
}
