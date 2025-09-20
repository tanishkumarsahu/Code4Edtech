import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resume Relevance System | AI-Powered Resume Screening",
  description: "Automated resume relevance check system using AI to match resumes with job descriptions. Built for Theme 2 Hackathon.",
  keywords: ["resume", "AI", "screening", "job matching", "automation", "recruitment"],
  authors: [{ name: "Resume Relevance Team" }],
  creator: "Resume Relevance System",
  publisher: "Resume Relevance System",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resume-relevance-system.vercel.app",
    title: "Resume Relevance System",
    description: "AI-Powered Resume Screening and Job Matching Platform",
    siteName: "Resume Relevance System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Relevance System",
    description: "AI-Powered Resume Screening and Job Matching Platform",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
