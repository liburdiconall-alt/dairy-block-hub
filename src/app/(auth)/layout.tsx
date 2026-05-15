export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-db-black grid lg:grid-cols-2">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-db-teal/20 via-transparent to-db-mint/10 pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-db-mint/10 db-blob translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-db-teal/10 db-shape -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <span className="section-label text-db-mint text-xs">Dairy Block</span>
          <p className="font-display text-white text-2xl font-bold mt-1">Maintenance &<br />Security Hub</p>
        </div>

        <div className="relative z-10">
          <p className="font-script text-db-marigold text-3xl mb-4">Built for the block.</p>
          <p className="text-db-gray-300 text-base leading-relaxed max-w-xs font-light">
            One place to submit requests, track progress, and keep Dairy Block running beautifully.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              'Submit maintenance & security requests',
              'Track status in real time',
              'Automated email updates',
              'Staff & tenant portals',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-db-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-db-teal flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-db-gray-600 text-xs">
          © {new Date().getFullYear()} Dairy Block · 1800 Wazee St, Denver
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 bg-db-white lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
