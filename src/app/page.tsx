'use client';

import { useState } from 'react';
import { Download, Plus, QrCode } from 'lucide-react';
import { generateCarId } from '@/lib/utils';
import Image from 'next/image';

export default function Home() {
  const [qrData, setQrData] = useState<{ url: string, image: string, id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateNewTag = async () => {
    setLoading(true);
    try {
      // Generate a random ID client-side or via API if needed.
      // Using the API ensures we get a valid formatted QR image returned.
      // We pass a random ID to the QR API to generate coordinates
      const randomId = generateCarId();

      const res = await fetch(`/api/qr?carId=${randomId}`);
      if (!res.ok) throw new Error('Failed to generate');

      const data = await res.json();
      setQrData({
        url: data.url,    // The URL embedded in QR (e.g. site.com/scan/ID)
        image: data.qrImage, // The base64 image
        id: randomId
      });
    } catch (e) {
      console.error(e);
      alert('Failed to generate tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQr = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.image;
    link.download = `car-tag-${qrData.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">

      {/* Background Atmosphere */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="z-10 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2 tracking-tighter">My Smart Tag</h1>
        <p className="text-muted-foreground mb-12">Generate a tag. Print it. Stick it.</p>

        {/* Card Container */}
        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center min-h-[400px] justify-center transition-all duration-500">

          {!qrData ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Tag Generated</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Create a unique QR code for your vehicle to get started.
              </p>
              <button
                onClick={generateNewTag}
                disabled={loading}
                className="group relative overflow-hidden bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Generating...' : <><Plus size={20} /> Generate New Tag</>}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full animate-in flip-in-y duration-700">
              <div className="bg-white p-4 rounded-xl shadow-inner mb-6 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-30 blur group-hover:opacity-50 transition-opacity duration-500"></div>
                <img
                  src={qrData.image}
                  alt="QR Code"
                  className="w-48 h-48 object-contain relative z-10"
                />
              </div>

              <div className="text-center mb-8">
                <p className="text-xs font-mono text-muted-foreground mb-1">TAG ID</p>
                <p className="text-2xl font-mono font-bold tracking-widest">{qrData.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={downloadQr}
                  className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-xl font-medium transition-colors"
                >
                  <Download size={18} /> Download
                </button>
                <button
                  onClick={() => setQrData(null)}
                  className="flex items-center justify-center gap-2 bg-secondary/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground py-3 rounded-xl font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground/60 max-w-xs">
                Download this image and verify by scanning it with your phone camera.
              </p>
            </div>
          )}

        </div>
      </div>

      <footer className="mt-auto py-6 text-center text-xs text-muted-foreground/40">
        Secure Vehicle Tag System &copy; 2026
      </footer>
    </div>
  );
}
