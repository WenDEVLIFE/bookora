import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { DemoStoreProvider } from "@/lib/demo-store";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bookora — Smart scheduling. Seamless experiences.",
    template: "%s · Bookora",
  },
  description:
    "Bookora is a demo appointment booking platform for salons and wellness studios. Discover services, choose a professional, and book a slot in minutes.",
  applicationName: "Bookora",
};

export const viewport: Viewport = {
  themeColor: "#0B0B10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-app text-ink font-sans">
        <DemoStoreProvider>{children}</DemoStoreProvider>
      </body>
    </html>
  );
}
