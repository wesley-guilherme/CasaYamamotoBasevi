// Estrutura raiz do site, metadados de compartilhamento com o logotipo, estilos e contexto da conta.
import "./globals.css";
import { AccountProvider } from "./account-bar";
import { siteMetadata } from "./site-metadata";

// Metadados globais usados pelo navegador, pelos mecanismos de busca e pelos cards de links compartilhados.
export const metadata = siteMetadata;

// Layout compartilhado por todas as páginas. Aqui são definidos o idioma do
// documento, os estilos globais e o ponto em que cada página será renderizada.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <html lang="pt-BR">
      <body><AccountProvider>{children}</AccountProvider></body>
    </html>
  );
}
