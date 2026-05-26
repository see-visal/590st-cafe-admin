// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import {
  Inter,
  Poppins,
  Roboto,
  Open_Sans,
  Montserrat,
  Lato,
  Source_Sans_3,
  Nunito,
  Work_Sans,
  // Khmer fonts
  Koh_Santepheap,
  Kantumruy_Pro,
  Battambang,
  Siemreap,
  Dangrek,
} from "next/font/google";
import ClientProvider from "@/components/provider/ClientProvider";

// English fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const kohSantepheap = Koh_Santepheap({
  subsets: ["khmer", "latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-koh-santepheap",
  display: "swap",
});

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  variable: "--font-kantumruy-pro",
  display: "swap",
});

const battambang = Battambang({
  subsets: ["khmer", "latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-battambang",
  display: "swap",
});

const siemreap = Siemreap({
  subsets: ["khmer"],
  weight: ["400"],
  variable: "--font-siemreap",
  display: "swap",
});

const dangrek = Dangrek({
  subsets: ["khmer"],
  weight: ["400"],
  variable: "--font-dangrek",
  display: "swap",
});


// favicon project of 590st CAFE
export const metadata: Metadata = {
  title: "590st CAFE",
  description: "590st CAFE Admin Dashboard",
  icons: {
    icon: "/Logo/Logo.svg",
    shortcut: "/Logo/Logo.svg",
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
      className={`
        ${inter.variable} 
        ${poppins.variable} 
        ${roboto.variable} 
        ${openSans.variable}
        ${montserrat.variable}
        ${lato.variable}
        ${sourceSans.variable}
        ${nunito.variable}
        ${workSans.variable}
        ${kohSantepheap.variable}
        ${kantumruyPro.variable}
        ${battambang.variable}
        ${siemreap.variable}
        ${dangrek.variable}
      `}
    >
      <body className="font-sans" suppressHydrationWarning>
        <ClientProvider>{children}</ClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
