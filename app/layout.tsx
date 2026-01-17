import type { Metadata } from "next";
import "./globals.css"; 
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "LoveCN - Drama Cina",
  description: "Streaming Drama Cina Subtitle Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}