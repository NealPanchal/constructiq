import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })

import { initializeSystem } from '@/lib/db'

export const metadata = {
  title: 'ConstructIQ | AI Construction Intelligence',
  description: 'Production-grade construction management and AI compliance platform.',
}

import ErrorBoundary from '@/components/shared/ErrorBoundary'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Trigger Production Startup Protocol
  await initializeSystem().catch(() => {
     console.error("SYSTEM_STARTUP_FAILURE: Protocol SAFE_MODE ENABLED.");
  });
  
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            id="razorpay-checkout"
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
        </head>
        <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-white text-black antialiased`}>
          <Toaster position="top-right" />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  )
}
