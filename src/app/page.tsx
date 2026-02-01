import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center relative overflow-hidden">
      <div className="absolute -top-20 -right-20 p-6 opacity-20 pointer-events-none">
        <div className="w-96 h-96 bg-primary blur-[120px] rounded-full"></div>
      </div>
      <div className="absolute top-40 -left-20 p-6 opacity-10 pointer-events-none">
        <div className="w-72 h-72 bg-purple-500 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 mt-20">
        <span className="inline-block py-1 px-3 rounded-full bg-secondary border border-border text-sm text-primary mb-6 animate-fade-in-up">
          🛡️ Next-Gen Vehicle Privacy
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Drive Safe.<br />Stay Private.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The smart way to let people contact you about your parked car without sharing your phone number.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
          >
            Get Your Tag
          </Link>
        </div>
      </div>

      <div className="mt-32 grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto w-full px-4">
        <FeatureCard
          icon="🔒"
          title="100% Private"
          desc="Your phone number is never revealed to the scanner. We mask your identity completely."
        />
        <FeatureCard
          icon="⚡"
          title="Instant Alerts"
          desc="Receive WhatsApp or SMS alerts instantly when someone scans your QR code."
        />
        <FeatureCard
          icon="🛑"
          title="No App Needed"
          desc="People can scan your tag with any standard camera. No app download required."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl glass hover:bg-secondary/80 transition-colors duration-300">
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
