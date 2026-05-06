import type { Metadata } from "next";
import { Outfit, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MANGA.IO | Read the Future",
  description: "Experience the next generation of digital manga. Immersive storytelling meets cutting-edge design.",
  keywords: ["manga", "comics", "digital reader", "anime", "future"],
};

import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased dark", outfit.variable, inter.variable, "font-sans", geist.variable)}>
      <body className="font-outfit bg-background text-foreground min-h-screen flex flex-col relative overflow-x-hidden">
        
        {/* Dynamic Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
        </div>

        <Providers>
          <Header />
          <main className="flex-1 relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
