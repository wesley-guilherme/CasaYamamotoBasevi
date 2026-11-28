// Centraliza os metadados do site e o logotipo público usado nos cards de compartilhamento.
import type { Metadata } from "next";

// Identifica o site no navegador e fornece uma base HTTPS para os endereços das imagens.
export const siteMetadata: Metadata = {
  metadataBase: new URL("https://www.casayamamoto.com.br"),
  title: "Casa Yamamoto Basevi | Casa de temporada em Prado–BA",
  description: "Casa de temporada com 4 suítes, piscina privativa e localização a 300 metros da praia em Prado, Bahia.",
  // Preserva o logotipo já utilizado como ícone do navegador.
  icons: {
    icon: "/logo-yamamoto.png",
    shortcut: "/logo-yamamoto.png",
  },
  // Apresenta a frase da casa e o símbolo oficial de 528 KB nos cards de compartilhamento.
  openGraph: {
    title: "Casa Yamamoto Basevi",
    description: "Seu REFÚGIO em PRADO-BA",
    siteName: "Casa Yamamoto Basevi",
    images: [
      {
        url: "/logo-symbol.png",
        width: 1774,
        height: 887,
        type: "image/png",
        alt: "Logotipo da Casa Yamamoto Basevi",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  // Oferece o mesmo logotipo e a mesma descrição às plataformas que leem Twitter Cards.
  twitter: {
    card: "summary_large_image",
    title: "Casa Yamamoto Basevi",
    description: "Seu REFÚGIO em PRADO-BA",
    images: ["/logo-symbol.png"],
  },
};
