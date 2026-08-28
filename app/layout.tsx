import type { Metadata } from "next";
import "./globals.css";

// Metadados globais usados pelo navegador e pelos mecanismos de busca.
export const metadata: Metadata = {
  metadataBase: new URL(
    "https://casa-yamamoto-basevi.wesley-analistasyste.chatgpt.site",
  ),
  title: "Casa Yamamoto Basevi | Casa de temporada em Prado–BA",
  description: "Casa de temporada com 4 suítes, piscina privativa e localização a 300 metros da praia em Prado, Bahia.",
  icons: {
    icon: "/logo-yamamoto.png",
    shortcut: "/logo-yamamoto.png",
  },
  openGraph: {
    title: "Casa Yamamoto Basevi",
    description: "Sua casa e seu guia de Prado e Costa das Baleias.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Casa Yamamoto Basevi — seu guia de Prado e Costa das Baleias",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa Yamamoto Basevi",
    description: "Sua casa e seu guia de Prado e Costa das Baleias.",
    images: ["/og.png"],
  },
  other: {
    "codex-preview": "development",
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
