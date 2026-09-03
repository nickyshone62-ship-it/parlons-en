import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PARLONS-EN | Plateforme d'entraide anonyme & bienveillante",
  description:
    "Expose anonymement tes difficultés et découvre des solutions sincères proposées par la communauté. Un espace sécurisé, sans jugement et bienveillant.",
  keywords: [
    "entraide",
    "anonymat",
    "soutien",
    "communaute",
    "conseils",
    "parlons-en",
    "ecoute",
  ],
  authors: [{ name: "PARLONS-EN Team" }],
};

import { ApprovalGuard } from "@/components/auth/ApprovalGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-600">
        <ApprovalGuard>{children}</ApprovalGuard>
      </body>
    </html>
  );
}
