import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

// ── Brand Fonts (Dairy Block Guidelines) ──────────────────────────────────────
// Display / Headlines: Jokker Medium
const jokkerMedium = localFont({
  src: [
    { path: '../../public/fonts/Jokker-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Jokker-Medium.woff',  weight: '500', style: 'normal' },
  ],
  variable: '--font-jokker-medium',
  display: 'swap',
})

// Primary header: Jokker Regular
const jokkerRegular = localFont({
  src: [
    { path: '../../public/fonts/Jokker-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Jokker-Regular.woff',  weight: '400', style: 'normal' },
  ],
  variable: '--font-jokker',
  display: 'swap',
})

// Secondary headers: Awesome Serif Medium Tall
const awesomeSerif = localFont({
  src: [
    { path: '../../public/fonts/AwesomeSerif-MediumTall.otf',       weight: '500', style: 'normal' },
    { path: '../../public/fonts/AwesomeSerifItalic-MediumTall.otf', weight: '500', style: 'italic' },
  ],
  variable: '--font-awesome-serif',
  display: 'swap',
})

// Body copy: Monas Grotesk Light
const monasGrotesk = localFont({
  src: [{ path: '../../public/fonts/MonasGrotesk-Light.otf', weight: '300', style: 'normal' }],
  variable: '--font-monas',
  display: 'swap',
})

// Design element: San Clemente Script (max once per page)
const sanClemente = localFont({
  src: [{ path: '../../public/fonts/SanClemente-Script.otf', weight: '400', style: 'normal' }],
  variable: '--font-san-clemente',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Dairy Block Hub',
    template: '%s · Dairy Block Hub',
  },
  description: "Tenant Hub for Dairy Block, Denver's premier LoDo micro-district.",
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jokkerMedium.variable} ${jokkerRegular.variable} ${awesomeSerif.variable} ${monasGrotesk.variable} ${sanClemente.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-monas)',
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
              },
              success: { iconTheme: { primary: '#29967F', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#F64741', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
