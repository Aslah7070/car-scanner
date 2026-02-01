import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Car from '@/models/Car';
import { generateCarId, isValidPhone } from '@/lib/utils';

export async function POST(req: Request) {
    try {
        const { vehicleNumber, phoneNumber, carId: providedCarId } = await req.json();

        if (!vehicleNumber || !phoneNumber) {
            return NextResponse.json({ error: 'Vehicle number and phone number are required.' }, { status: 400 });
        }

        console.log("Registering:", { vehicleNumber, phoneNumber, providedCarId });

        if (!isValidPhone(phoneNumber)) {
            return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 });
        }

        await connectDB();

        let carId = providedCarId || '';
        let unique = false;

        // If no carId provided (standard flow), generate one
        if (!carId) {
            while (!unique) {
                carId = generateCarId();
                const existing = await Car.findOne({ carId });
                if (!existing) unique = true;
            }
        } else {
            // If carId IS provided (scanning unregistered tag flow),
            // We need to check if it's already taken?
            // For now, we assume if the frontend sent it, they want to claim it.
            // But we should check if it's already active to avoid overwrites.
            const existing = await Car.findOne({ carId });
            if (existing) {
                // If it exists but is inactive, maybe reactivate? 
                // Or if we treat "Not Found" in API as "Unregistered", then it shouldn't exist in DB yet.
                // However, if we pre-generated tags, they WOULD exist in DB but maybe with no owner?
                // The current schema requires all fields. 
                // So if it exists, it's ALREADY REGISTERED.
                return NextResponse.json({ error: 'This Tag is already registered!' }, { status: 400 });
            }
        }

        const car = await Car.create({
            vehicleNumber,
            phoneNumber,
            carId,
        });

        console.log("car", car)


        return NextResponse.json({ success: true, carId: car.carId });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
