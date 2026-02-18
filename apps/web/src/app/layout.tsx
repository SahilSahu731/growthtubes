import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrowthTubes | Master Structured Learning",
  description: "Join the elite platform for learning structured skills, building high-impact projects, and scaling with a top-tier community. Web Dev, Design, Finance, and Business.",
  keywords: ["Learning", "Web Development", "Design", "Business", "Finance", "Education", "GrowthTubes"],
  authors: [{ name: "Sahil Sahu" }],
  openGraph: {
    title: "GrowthTubes | Master Structured Learning",
    description: "The only platform where you learn structured, prove it with projects, and grow with a community.",
    type: "website",
    url: "https://growthtubes.com",
    siteName: "GrowthTubes",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${jakarta.variable} ${geistMono.variable} antialiased bg-[#0a0a0b] text-[#fafafa]`}
      >
        {children}
      </body>
    </html>
  );
}
