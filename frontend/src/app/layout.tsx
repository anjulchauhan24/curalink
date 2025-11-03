// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CuraLink | Connecting Patients & Researchers',
  description:
    'AI-powered platform bridging patients, researchers, and clinical trials for better healthcare innovation.',
  keywords: 'CuraLink, clinical trials, health research, AI healthcare, patient network',
  authors: [{ name: 'CuraLink Team' }],
  openGraph: {
    title: 'CuraLink | Connecting Patients & Researchers',
    description:
      'Join CuraLink to discover clinical trials, connect with experts, and contribute to medical breakthroughs.',
    url: 'https://curalink.ai',
    siteName: 'CuraLink',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CuraLink - Connecting Patients & Researchers',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider> */}
      </body>
    </html>
  )
}