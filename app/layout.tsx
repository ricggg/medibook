import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediBook — Book Verified Doctors Instantly',
  description:
    'MediBook connects patients with 500+ verified doctors. Book appointments in 60 seconds, get digital prescriptions, and manage your health records — all in one HIPAA-secure platform.',
  keywords: 'doctor appointment, online booking, telemedicine, healthcare SaaS',
  openGraph: {
    title: 'MediBook — Book Verified Doctors Instantly',
    description: 'Healthcare booking SaaS trusted by 50,000+ patients.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}