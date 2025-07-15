import type { Metadata } from 'next'
import './globals.css'
import { FaceDetectionProvider } from './providers'

export const metadata: Metadata = {
  title: 'Workzen',
  description: 'Your productivity companion',
  icons: {
    icon: '/favicon-32.png',
    apple: '/favicon-32.png',
    shortcut: '/favicon-32.png',
  },
  generator: 'Workzen',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <FaceDetectionProvider>
          {children}
        </FaceDetectionProvider>
      </body>
    </html>
  )
}
