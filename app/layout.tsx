import type { Metadata, Viewport } from "next";
import { Fragment, type ComponentType, type ReactNode } from "react";
import { Geist } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { isLocal } from "@/lib/runtime/mode";
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

async function getAuthWrapper(): Promise<ComponentType<{ children: ReactNode }>> {
  if (isLocal()) {
    return Fragment;
  }
  const { ClerkProvider } = await import("@clerk/nextjs");
  return ClerkProvider as ComponentType<{ children: ReactNode }>;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const Wrapper = await getAuthWrapper();
  return (
    <Wrapper>
      <html
        lang="ko"
        className={`${geistSans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <ServiceWorkerRegistration />
        </body>
      </html>
    </Wrapper>
  );
}
