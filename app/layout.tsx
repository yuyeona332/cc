import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "connection-care",
  description: "고립 상태에서 한 단계 나아가는 작은 매일의 행동.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "care",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ko"
        className={`${geistSans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}
