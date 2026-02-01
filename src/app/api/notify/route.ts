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

        // Check for Twilio Credentials and Send
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;

        if (accountSid && authToken && fromPhone) {
            try {
                // Dynamic import to avoid build errors if package is missing during initial checks
                const twilio = (await import('twilio')).default;
                const client = twilio(accountSid, authToken);

                // Determine if using WhatsApp (if phoneNumber or fromPhone starts with 'whatsapp:')
                // For simplicity, we just check if the user number needs 'whatsapp:' prefix based on environment setup
                // or just default to SMS unless specified.
                // A common pattern is having a separate TWILIO_WHATSAPP_NUMBER or using the same number with prefix.

                // Construct message
                const alertBody = `[Car Alert] ${type.toUpperCase()}: ${message || 'Alert received'}. Vehicle: ${car.vehicleNumber}`;

                // Send SMS/WhatsApp
                await client.messages.create({
                    body: alertBody,
                    from: fromPhone,
                    to: car.phoneNumber,
                });

                console.log(`[TWILIO] Sent to ${car.phoneNumber}`);
            } catch (twilioError) {
                console.error('Twilio Send Error:', twilioError);
                // We don't return error to client to avoid leaking backend details, 
                // but we log it. The client still sees "success" as the alert is saved in DB.
            }
        } else {
            console.log('[NOTIFICATION MOCK] Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
        }

        return NextResponse.json({ success: true, message: 'Owner notified successfully' });

    } catch (error) {
        console.error('Notify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
