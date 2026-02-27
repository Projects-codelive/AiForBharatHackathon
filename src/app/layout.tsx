/**
 * Root layout — sets up fonts, Tailwind base, and wraps app in SessionProvider.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "RepoLens — AI GitHub Repository Analyzer",
  description:
    "Analyze any public GitHub repository with AI: architecture diagrams, route breakdowns, commit timelines, and more.",
  keywords: ["GitHub", "repository", "analyzer", "AI", "code analysis", "architecture"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
