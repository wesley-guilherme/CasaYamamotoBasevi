import type { Metadata } from "next";
import "./globals.css";

// Metadados globais usados pelo navegador e pelos mecanismos de busca.
export const metadata: Metadata = {
  title: "Casa Yamamoto Basevi | Casa de temporada em Prado–BA",
  description: "Casa de temporada com 4 suítes, piscina privativa e localização a 300 metros da praia em Prado, Bahia.",
  icons: {
    icon: "/logo-yamamoto.png",
    shortcut: "/logo-yamamoto.png",
  },
};

// Layout compartilhado por todas as páginas. Aqui são definidos o idioma do
// documento, os estilos globais e o ponto em que cada página será renderizada.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
