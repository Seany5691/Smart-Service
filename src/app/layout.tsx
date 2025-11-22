import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { KeyboardNavigationProvider } from "@/components/KeyboardNavigationProvider";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Service Ticketing System",
  description: "Comprehensive service ticketing and management platform",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover", // Support for notched devices
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <KeyboardNavigationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </KeyboardNavigationProvider>
        <Toaster position="top-right" richColors />
        {/* Performance monitoring - only shows debug panel in development */}
        <PerformanceMonitor showDebugPanel={process.env.NODE_ENV === 'development'} />
      </body>
    </html>
  );
}
