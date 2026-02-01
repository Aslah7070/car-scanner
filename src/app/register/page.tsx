'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            vehicleNumber: formData.get('vehicleNumber'),
            phoneNumber: formData.get('phoneNumber')
        };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Something went wrong');

            router.push(`/dashboard?carId=${json.carId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 relative">
            <div className="w-full max-w-md p-8 rounded-2xl glass border border-border shadow-2xl relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Register Vehicle</h1>
                    <p className="text-muted-foreground">Create your secure privacy tag.</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 text-sm font-medium animate-pulse">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="group">
                        <label className="block text-sm font-medium mb-2 text-muted-foreground group-focus-within:text-primary transition-colors">Vehicle Number</label>
                        <input
                            name="vehicleNumber"
                            required
                            placeholder="e.g. KA-01-AB-1234"
                            className="w-full bg-secondary/50 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg placeholder:text-muted-foreground/30"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-sm font-medium mb-2 text-muted-foreground group-focus-within:text-primary transition-colors">Phone Number</label>
                        <input
                            name="phoneNumber"
                            required
                            type="tel"
                            placeholder="+91 98765 00000"
                            className="w-full bg-secondary/50 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg placeholder:text-muted-foreground/30"
                        />
                        <p className="text-xs text-muted-foreground mt-2">We'll only use this to send you alerts. It remains hidden.</p>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Tag'}
                    </button>
                </form>

            </div>
            <p className="mt-8 text-sm text-muted-foreground text-center">
                Already have a tag? <Link href="/search" className="underline hover:text-primary">Find it here</Link>
            </p>
        </div>
    )
}
