import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wikipedia Learn — Le Moyen-Âge",
  description: "Plateforme d'apprentissage gamifiée sur le Moyen-Âge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
