import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Kantumruy_Pro, Poppins } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.scss";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  variable: "--font-kantumruy-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "590st CAFE",
  description: "590st CAFE Admin Dashboard",
  icons: {
    icon: "/logos/logoWhite.svg",
    shortcut: "/logos/logoWhite.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${kantumruyPro.variable}`}
    >
      <body className="font-sans" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
