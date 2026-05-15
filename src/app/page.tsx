import Link from 'next/link'
import { ArrowRight, Wrench, Shield, Clock, CheckCircle2, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-db-black overflow-hidden">

      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8">
        <div>
          <span className="section-label text-db-mint">Dairy Block</span>
          <p className="font-display text-white text-lg font-bold leading-tight mt-0.5">
            Maintenance &<br />Security Hub
          </p>
        </div>
        <Link href="/login" className="btn-ghost text-white border-white/20 hover:bg-white/10 hover:text-white text-sm">
          Sign in
        </Link>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative px-6 sm:px-10 pt-16 pb-20">

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-db-teal/10 db-blob translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-db-mint/8 db-shape -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <p className="font-script text-db-marigold text-2xl mb-3">Built for the block.</p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Your space.<br />
            <span className="text-db-mint">Taken care of.</span>
          </h1>
          <p className="text-db-gray-300 text-lg sm:text-xl leading-relaxed max-w-xl mb-10 font-light">
            Submit maintenance and security requests, track progress in real time, and stay connected
            with the Dairy Block team — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/login?portal=tenant" className="btn-teal text-base px-6 py-3">
              Tenant Portal <ArrowRight size={18} />
            </Link>
            <Link href="/login?portal=staff" className="btn-ghost text-white border-white/20 hover:bg-white/10 hover:text-white text-base px-6 py-3">
              Staff Access
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature strips ──────────────────────────────────────────── */}
      <section className="bg-db-white px-6 sm:px-10 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-3">How it works</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-db-black mb-12 max-w-lg">
            Requests handled with the care Dairy Block is known for.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Wrench size={20} />,
                color: 'bg-db-teal/10 text-db-teal',
                title: 'Maintenance Requests',
                desc: 'HVAC, plumbing, electrical, lighting, and more. Submit once, track every step.',
              },
              {
                icon: <Shield size={20} />,
                color: 'bg-db-orange/10 text-db-orange',
                title: 'Security Reports',
                desc: 'Access control, incident reports, after-hours escort, and safety concerns — handled discreetly.',
              },
              {
                icon: <Clock size={20} />,
                color: 'bg-db-marigold/10 text-db-marigold',
                title: 'Real-Time Updates',
                desc: 'Every status change hits your inbox and dashboard instantly. No more wondering.',
              },
              {
                icon: <CheckCircle2 size={20} />,
                color: 'bg-db-mint text-db-teal-dark',
                title: 'Transparent Workflow',
                desc: 'Full ticket history, assigned staff, scheduled times, and completion verification — always visible.',
              },
              {
                icon: <Users size={20} />,
                color: 'bg-db-black text-db-mint',
                title: 'Staff Dashboard',
                desc: 'Property managers, technicians, and security officers all work from one unified hub.',
              },
              {
                icon: <ArrowRight size={20} />,
                color: 'bg-db-red/10 text-db-red',
                title: 'Emergency Escalation',
                desc: 'Emergency requests trigger instant alerts to on-call staff and management.',
              },
            ].map((f) => (
              <div key={f.title} className="db-card p-6 hover:shadow-card-hover transition-shadow duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-db-black mb-2">{f.title}</h3>
                <p className="text-sm text-db-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────── */}
      <section className="bg-db-mint-light px-6 sm:px-10 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="font-script text-db-teal text-xl block mb-2">LoDo's community of makers</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-db-black mb-4">
            Ready to get started?
          </h2>
          <p className="text-db-gray-500 mb-8 leading-relaxed">
            Log in with your Dairy Block tenant or staff credentials to access the hub.
          </p>
          <Link href="/login" className="btn-primary text-base px-8 py-3">
            Sign In to the Hub <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-db-black px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="section-label text-db-mint text-xs">Dairy Block</span>
          <p className="text-db-gray-500 text-sm mt-1">1800 Wazee St, Denver, CO 80202</p>
        </div>
        <p className="text-db-gray-600 text-xs">
          © {new Date().getFullYear()} Dairy Block. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
