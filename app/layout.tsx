import type { Metadata } from "next";
import {
  Anton,
  Inter,
  Alumni_Sans_Pinstripe,
  Italianno,
  Poiret_One,
} from "next/font/google";
import "./globals.css";
import { NavigationWrapper } from "./components/Navigation/NavigationWrapper";
import { ThemeProvider } from "./components/ThemeProvider";

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

const italianno = Italianno({
  weight: "400",
  variable: "--font-italianno",
  subsets: ["latin"],
});

const poiretOne = Poiret_One({
  weight: "400",
  variable: "--font-poiret",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${inter.variable} ${alumniSansPinstripe.variable} ${italianno.variable} ${poiretOne.variable} antialiased font-body`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationWrapper />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
