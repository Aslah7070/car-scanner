
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Car from '@/models/Car';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ carId: string }> } // Standard Next.js 15+ param handling
) {
    // Await params object primarily for safety in future versions, 
    // though in standard route handlers context might be different. 
    // Adapting to safe generic extraction.
    const { carId } = await params;

    if (!carId) {
        return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    try {
        await connectDB();
        const car = await Car.findOne({ carId });

        if (!car) {
            // Return 404 but with a specific payload to indicate "Tag Available" logic on frontend
            return NextResponse.json({ found: false, carId }, { status: 404 });
        }

        if (!car.isActive) {
            return NextResponse.json({ error: 'This tag has been disabled by the owner.' }, { status: 403 });
        }

        // Return only contact info. NO alerts logic here.
        return NextResponse.json({
            found: true,
            vehicleNumber: car.vehicleNumber,
            phoneNumber: car.phoneNumber
        });

    } catch (error) {
        console.error('Fetch Car Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
