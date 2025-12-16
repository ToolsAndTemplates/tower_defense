import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tower Defense Game",
  description: "An engaging tower defense game built with Next.js. Defend your base from waves of enemies with strategic tower placement!",
  keywords: ["tower defense", "game", "strategy", "defense game", "browser game"],
  authors: [{ name: "Ismat Samadov" }],
  creator: "Ismat Samadov",
  openGraph: {
    title: "Tower Defense Game",
    description: "Defend your base from waves of enemies with strategic tower placement!",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e293b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
