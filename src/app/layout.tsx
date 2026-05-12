import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkVerse - AI-Powered Social Media Deep Linking",
  description: "LinkVerse is an AI-powered platform for creating, managing, and optimizing deep links across all social media platforms. Built for the modern web.",
  keywords: ["LinkVerse", "deep linking", "social media", "AI", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  authors: [{ name: "LinkVerse Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "LinkVerse - AI-Powered Deep Linking",
    description: "Create, manage, and optimize deep links across all social media platforms",
    url: "https://linkverse.app",
    siteName: "LinkVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkVerse - AI-Powered Deep Linking",
    description: "Create, manage, and optimize deep links across all social media platforms",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <TooltipProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
