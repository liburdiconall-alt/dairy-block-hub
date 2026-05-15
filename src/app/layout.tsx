import type { Metadata } from 'next'
import { Syne, Playfair_Display, Inter, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  weight: ['500', '600'],
})

export const metadata: Metadata = {
  title: {
    default: 'Dairy Block Hub',
    template: '%s · Dairy Block Hub',
  },
  description: "Maintenance & Security Request Hub for Dairy Block, Denver's premier LoDo micro-district.",
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${playfair.variable} ${inter.variable} ${dancing.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-inter)',
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
