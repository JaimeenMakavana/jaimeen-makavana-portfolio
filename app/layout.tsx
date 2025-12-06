import type { Metadata } from "next";
import { Anton, Inter, Alumni_Sans_Pinstripe } from "next/font/google";
import "./globals.css";
import { NavigationWrapper } from "./components/Navigation/NavigationWrapper";

const anton = Anton({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  subsets: ["latin"],
});

const alumniSansPinstripe = Alumni_Sans_Pinstripe({
  weight: "400",
  variable: "--font-alumni",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jay makavana Portfolio",
  description:
    "Designer based in Germany. Transforming ideas into impactful designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${inter.variable} ${alumniSansPinstripe.variable} antialiased font-body`}
      >
        <NavigationWrapper />
        {children}
      </body>
    </html>
  );
}
