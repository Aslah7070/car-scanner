'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2, Download, Check, ShieldCheck } from 'lucide-react';

function DashboardContent() {
    const searchParams = useSearchParams();
    const carId = searchParams.get('carId');
    const [qrData, setQrData] = useState<{ qrImage: string, url: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!carId) return;
        fetch(`/api/qr?carId=${carId}`)
            .then(res => res.json())
            .then(data => {
                if (data.qrImage) setQrData(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [carId]);

    const downloadQR = () => {
        if (!qrData) return;
        const link = document.createElement('a');
        link.href = qrData.qrImage;
        link.download = `secure-qr-${carId}.png`;
        link.click();
    }

    if (!carId) return <div className="text-center p-20 text-muted-foreground">Missing Car ID</div>

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md p-8 rounded-2xl glass border border-border text-center shadow-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-6 shadow-glow-green">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold mb-4">You're Protected!</h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    Your privacy shield is active. Download your unique QR tag and place it on your windshield.
                </p>

                {loading ? (
                    <div className="h-64 w-64 mx-auto flex items-center justify-center bg-white/5 rounded-xl mb-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : qrData ? (
                    <div className="bg-white p-4 rounded-xl mb-8 shadow-inner border-4 border-white/10 mx-auto w-fit">
                        <img src={qrData.qrImage} alt="QR Code" className="w-56 h-56 object-contain" />
                    </div>
                ) : (
                    <div className="h-56 flex items-center justify-center text-red-400 bg-red-500/10 rounded-xl mb-8">Failed to load QR</div>
                )}

                <button
                    onClick={downloadQR}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Download className="w-5 h-5" /> Download QR Code
                </button>
                <p className="text-xs text-muted-foreground mt-6">
                    Tip: Print this on a sticker or regular paper.
                </p>
            </div>
        </div>
    )
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <DashboardContent />
        </Suspense>
    )
}
