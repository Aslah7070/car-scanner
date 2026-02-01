import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Car from '@/models/Car';
import { generateCarId, isValidPhone } from '@/lib/utils';

export async function POST(req: Request) {
    try {
        const { vehicleNumber, phoneNumber } = await req.json();

        if (!vehicleNumber || !phoneNumber) {
            return NextResponse.json({ error: 'Vehicle number and phone number are required.' }, { status: 400 });
        }
console.log("vehicleNumber",vehicleNumber)
        console.log("phoneNumber",phoneNumber)

        if (!isValidPhone(phoneNumber)) {
            return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 });
        }
        

        await connectDB();

        // Check if vehicle already exists? 
        // Maybe update it? Or allow duplicates? 
        // "Unique carId" is required.
        // For now, allow multiple registrations for same vehicle (maybe new owner), but separate carIds.

        let unique = false;
        let carId = '';
        while (!unique) {
            carId = generateCarId();
            const existing = await Car.findOne({ carId });
            if (!existing) unique = true;
        }

        const car = await Car.create({
            vehicleNumber,
            phoneNumber,
            carId,
        });

             console.log("car",car)
    

        return NextResponse.json({ success: true, carId: car.carId });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
