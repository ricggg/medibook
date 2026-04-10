import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "MediBook — Clinic Management SaaS",
  description: "Smart appointment scheduling, patient management, and analytics for clinics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}

