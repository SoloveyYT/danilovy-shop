import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { SHOP_NAME } from "@/lib/constants";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Inter — есть кириллица; DM Sans в next/font не отдаёт subset cyrillic */
const sans = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SHOP_NAME} — ремонт и изготовление`,
    template: `%s — ${SHOP_NAME}`,
  },
  description:
    "Ремонт и изготовление ювелирных изделий в Москве. Лазерная пайка, закрепка камней, каталог серебра.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </CartProvider>
        <Footer />
      </body>
    </html>
  );
}
