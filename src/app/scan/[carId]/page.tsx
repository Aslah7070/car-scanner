'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CarFront, Phone, Loader2, Save, UserPlus } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
    if (res.status === 404) return { found: false }; // Handle 404 as data, not error
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
});

export default function ScanPage() {
    const params = useParams();
    const router = useRouter();
    const carId = params?.carId as string;

    // Fetch car data using SWR
    const { data, error, isLoading, mutate } = useSWR(`/api/car/${carId}`, fetcher);

    // Registration Form State
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRegLoading(true);
        setRegError('');

        const formData = new FormData(e.currentTarget);
        const submitData = {
            vehicleNumber: formData.get('vehicleNumber'),
            phoneNumber: formData.get('phoneNumber'),
            carId: carId // IMPORTANT: Register THIS specific scanned ID
        };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify(submitData),
                headers: { 'Content-Type': 'application/json' }
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Registration failed');

            // Refresh data to show the Contact Card immediately
            mutate();
        } catch (err: any) {
            setRegError(err.message);
        } finally {
            setRegLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-red-500 bg-red-500/10 p-4 rounded-xl">
                    Failed to load tag data. Please try again.
                </div>
            </div>
        );
    }

    // --- CASE 1: NOT REGISTERED (Show Register Form) ---
    if (data && data.found === false) {
        return (
            <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto justify-center">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <UserPlus className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Unregistered Tag</h1>
                    <p className="text-muted-foreground">This QR code is active but not linked to a vehicle yet.</p>
                </div>

                <div className="glass p-8 rounded-2xl border border-border shadow-xl">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Save className="w-5 h-5 text-primary" /> Register Now
                    </h2>

                    {regError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                            {regError}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Vehicle Number</label>
                            <input
                                name="vehicleNumber"
                                required
                                placeholder="e.g. KA-01-AB-1234"
                                className="w-full bg-secondary/50 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Phone Number</label>
                            <input
                                name="phoneNumber"
                                required
                                type="tel"
                                placeholder="+91 99999 88888"
                                className="w-full bg-secondary/50 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                        <button
                            disabled={regLoading}
                            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold mt-2 hover:bg-primary/90 transition-all disabled:opacity-70 flex justify-center"
                        >
                            {regLoading ? <Loader2 className="animate-spin" /> : 'Link to this QR'}
                        </button>
                    </form>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-8 opacity-60">
                    Once registered, scanning this QR will show these details.
                </p>
            </div>
        )
    }

    // --- CASE 2: REGISTERED (Show Contact Details) ---
    return (
        <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

            <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-full bg-secondary mb-6 shadow-lg">
                    <CarFront className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Vehicle Contact</h1>
                <p className="text-muted-foreground">Owner details for this vehicle.</p>
            </div>

            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                {/* Vehicle Number Card */}
                <div className="glass p-6 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Vehicle Number</span>
                    <span className="text-3xl font-mono font-bold text-foreground bg-secondary/50 px-4 py-2 rounded-lg border border-secondary">
                        {data.vehicleNumber}
                    </span>
                </div>

                {/* Phone Number Card */}
                <div className="glass p-6 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-lg bg-gradient-to-br from-secondary/30 to-background">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Contact Number</span>
                    <a href={`tel:${data.phoneNumber}`} className="flex items-center gap-3 text-3xl font-bold text-primary hover:underline decoration-2 underline-offset-4 transition-all">
                        <Phone className="w-8 h-8 fill-current" />
                        {data.phoneNumber}
                    </a>
                    <p className="text-xs text-muted-foreground mt-4">Tap to Call</p>
                </div>
            </div>

            <footer className="mt-12 text-center text-sm text-muted-foreground">
                <p>Scanner App</p>
            </footer>
        </div>
    );
}

// Helper specific to this file not needed outside
function AlertButton() { return null; }
