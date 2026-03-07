import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0515] text-white overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <span className="text-xl font-bold text-white">CareCall</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white no-underline transition-all">
              Log In
            </Link>
            <Link to="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 rounded-full no-underline backdrop-blur transition-all border border-white/10">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — Full bleed with caregiver image */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-caregiver.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0515]/70 via-[#0a0515]/50 to-[#0a0515]" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/10">
            <span>✨</span> AI-Powered Health Reminders
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            AI Health Reminder
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Calls for Seniors
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Help your parents and grandparents stay on track with medications while giving you peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full no-underline shadow-2xl shadow-purple-500/25 transition-all hover:-translate-y-0.5"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-full no-underline backdrop-blur transition-all hover:-translate-y-0.5"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features — White text on gradient */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0515] via-purple-950/50 to-[#0a0515]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 tracking-tight">
            How CareCall Works
          </h2>
          <p className="text-xl text-white/50 text-center mb-20 max-w-xl mx-auto font-light">
            A simple, powerful system that keeps your loved ones safe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <FeatureItem
              icon="📞"
              title="AI Medication Reminders"
              description="Automated, friendly phone calls remind your loved ones to take their medications — on time, every time."
            />
            <FeatureItem
              icon="❤️"
              title="Wellness Check-ins"
              description="Simple daily questions monitor how they're feeling. No apps needed — just answer the phone."
            />
            <FeatureItem
              icon="📊"
              title="Caregiver Dashboard"
              description="View adherence data, call logs, and real-time alerts all in one place from any device."
            />
            <FeatureItem
              icon="🚨"
              title="Emergency Alerts"
              description="Instant notifications when a dose is missed or they report feeling unwell."
            />
          </div>
        </div>
      </section>

      {/* For Patients / For Caretakers */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0515] via-blue-950/40 to-[#0a0515]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20 tracking-tight">
            Simple for Everyone
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-10">
              <div className="text-5xl mb-6">👴</div>
              <h3 className="text-2xl font-bold mb-6">For Your Loved Ones</h3>
              <ul className="space-y-4 text-white/70 text-lg">
                <li className="flex items-start gap-3"><span className="text-purple-400">✓</span> Friendly AI phone calls</li>
                <li className="flex items-start gap-3"><span className="text-purple-400">✓</span> No apps or devices needed</li>
                <li className="flex items-start gap-3"><span className="text-purple-400">✓</span> Simple yes/no answers</li>
                <li className="flex items-start gap-3"><span className="text-purple-400">✓</span> Easy wellness check-ins</li>
              </ul>
            </div>
            <div className="glass rounded-3xl p-10">
              <div className="text-5xl mb-6">🩺</div>
              <h3 className="text-2xl font-bold mb-6">For You, the Caretaker</h3>
              <ul className="space-y-4 text-white/70 text-lg">
                <li className="flex items-start gap-3"><span className="text-blue-400">✓</span> Real-time adherence tracking</li>
                <li className="flex items-start gap-3"><span className="text-blue-400">✓</span> Instant missed-dose alerts</li>
                <li className="flex items-start gap-3"><span className="text-blue-400">✓</span> Schedule calls via Twilio</li>
                <li className="flex items-start gap-3"><span className="text-blue-400">✓</span> Peace of mind, anywhere</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0515] to-purple-950/30" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/60 mb-10 font-light">
            Give your loved ones the support they deserve — one phone call at a time.
          </p>
          <Link
            to="/signup"
            className="inline-block px-12 py-5 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full no-underline shadow-2xl shadow-purple-500/25 transition-all hover:-translate-y-1"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <span className="text-lg font-bold text-white">CareCall</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/" className="hover:text-white no-underline text-white/40">Home</Link>
            <Link to="/login" className="hover:text-white no-underline text-white/40">Log In</Link>
            <Link to="/signup" className="hover:text-white no-underline text-white/40">Sign Up</Link>
          </div>
          <p className="text-sm text-white/30">© 2026 CareCall. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex gap-5">
      <div className="text-4xl flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/50 text-lg leading-relaxed font-light">{description}</p>
      </div>
    </div>
  );
}
