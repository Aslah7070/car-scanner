import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Car from '@/models/Car';

export async function POST(req: Request) {
    try {
        const { carId, type, message } = await req.json();
        // Headers for IP
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        if (!carId || !type) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await connectDB();
        const car = await Car.findOne({ carId });

        if (!car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        if (!car.isActive) {
            return NextResponse.json({ error: 'QR Code is disabled by owner' }, { status: 403 });
        }

        // Rate limit check (basic) - check last alert time
        const lastAlert = car.alerts[car.alerts.length - 1];
        if (lastAlert) {
            const timeDiff = new Date().getTime() - new Date(lastAlert.timestamp).getTime();
            if (timeDiff < 60000) { // 1 minute cooldown
                return NextResponse.json({ error: 'Please wait before sending another alert.' }, { status: 429 });
            }
        }

        // Add alert to history
        car.alerts.push({
            type,
            ip: Array.isArray(ip) ? ip[0] : ip,
            message,
            timestamp: new Date() as any // TS issue with Date/string? mongoose handles it.
        });

        // Explicitly casting or letting mongoose handle type coercion

        await car.save();

        // MOCK Notification
        console.log(`[NOTIFICATION] Sending ${type} alert to ${car.phoneNumber} for car ${car.vehicleNumber}. Message: ${message || 'No message'}`);

        // In production, integrate Twilio/WhatsApp API here.

        return NextResponse.json({ success: true, message: 'Owner notified successfully' });

    } catch (error) {
        console.error('Notify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
