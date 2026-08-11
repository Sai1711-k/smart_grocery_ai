import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Smart Grocery AI — Fresh Groceries in 10 Minutes",
  description: "Premium grocery shopping experience with AI diet planner and lightning-fast delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full bg-neutral-50 font-sans">
        {/* Full-Screen Desktop Layout */}
        <div className="w-full bg-white min-h-screen relative flex flex-col overflow-hidden">
          <AppProviders>
            {children}
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
