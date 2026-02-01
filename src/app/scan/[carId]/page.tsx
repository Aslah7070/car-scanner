'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, CarFront, Lightbulb, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';

export default function ScanPage() {
    // Unwrapping params is sometimes necessary in newer Next.js versions if treating as props, but useParams hook handles it.
    const params = useParams();
    const carId = params?.carId as string;
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const sendAlert = async (type: string, msg?: string) => {
        setStatus('sending');
        setErrorMessage('');
        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                body: JSON.stringify({
                    carId,
                    type,
                    message: msg || customMessage
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const d = await res.json();
            if (!res.ok) {
                throw new Error(d.error || 'Failed');
            }
            setStatus('sent');
        } catch (e: any) {
            setStatus('error');
            setErrorMessage(e.message || 'Error occurred');
        }
    };

    if (status === 'sent') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-green">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Alert Sent!</h1>
                <p className="text-muted-foreground max-w-xs mx-auto">The vehicle owner has been notified via WhatsApp/SMS immediately.</p>
                <p className="text-sm text-muted-foreground mt-2">Thank you for helping!</p>
                <button onClick={() => setStatus('idle')} className="mt-12 px-8 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium">Notify Again</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen p-4 max-w-lg mx-auto justify-between">
            <header className="py-6 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground mb-2">Secure & Private</div>
                <h1 className="text-3xl font-bold">Vehicle Alert</h1>
                <p className="text-muted-foreground mt-1">Found an issue with this car?</p>
            </header>

            <div className="flex-1 grid gap-4 content-center py-4">
                <AlertButton
                    icon={<CarFront size={32} />}
                    label="Blocking the Way"
                    color="bg-gradient-to-br from-red-500 to-red-600"
                    onClick={() => sendAlert('block', 'Your car is blocking the way.')}
                    disabled={status === 'sending'}
                />
                <AlertButton
                    icon={<Lightbulb size={32} />}
                    label="Lights Are On"
                    color="bg-gradient-to-br from-yellow-400 to-yellow-600"
                    onClick={() => sendAlert('light', 'You left your lights on.')}
                    disabled={status === 'sending'}
                />
                <AlertButton
                    icon={<AlertTriangle size={32} />}
                    label="Emergency"
                    color="bg-gradient-to-br from-orange-500 to-orange-700"
                    onClick={() => sendAlert('emergency', 'There is an emergency with your car.')}
                    disabled={status === 'sending'}
                />

                <div className="mt-2">
                    <button
                        onClick={() => setShowCustom(!showCustom)}
                        className="w-full py-4 rounded-xl border border-secondary bg-secondary/30 flex items-center justify-center gap-2 text-muted-foreground hover:bg-secondary/50 transition-all hover:text-white"
                    >
                        <MessageSquare size={20} /> {showCustom ? 'Cancel Message' : 'Write Custom Message'}
                    </button>
                </div>

                {showCustom && (
                    <div className="mt-2 glass p-4 rounded-xl animate-in fade-in slide-in-from-bottom-4 border-l-4 border-l-primary">
                        <textarea
                            value={customMessage}
                            onChange={e => setCustomMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full bg-secondary/50 border border-input rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary mb-3 h-24 text-base resize-none"
                        />
                        <button
                            onClick={() => sendAlert('other')}
                            disabled={!customMessage.trim() || status === 'sending'}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex justify-center items-center"
                        >
                            {status === 'sending' ? <Loader2 className="animate-spin" /> : 'Send Message'}
                        </button>
                    </div>
                )}
            </div>

            {status === 'error' && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center animate-pulse">
                    {errorMessage || 'Failed to send alert. Try again.'}
                </div>
            )}

            <footer className="py-6 text-center text-xs text-muted-foreground opacity-50">
                Privacy Protected by SecureQR System
            </footer>
        </div>
    )
}

function AlertButton({ icon, label, color, onClick, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-6 md:py-8 rounded-2xl flex items-center px-6 gap-6 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 ${color} text-white shadow-lg relative overflow-hidden group`}
        >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-inner">{icon}</div>
            <span className="text-xl font-bold tracking-wide text-left">{label}</span>
        </button>
    )
}
