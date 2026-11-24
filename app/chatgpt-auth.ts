// Leitura da identidade e construção de caminhos de autenticação geridos pela plataforma.
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Identidade do usuário recebida pelos cabeçalhos da plataforma.
export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

// Nome do cabeçalho enviado pela plataforma para identificar o usuário.
const USER_ID_HEADER = "oai-authenticated-user-id";
// Nome do cabeçalho enviado pela plataforma para identificar o usuário.
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
// Nome do cabeçalho enviado pela plataforma para identificar o usuário.
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
// Nome do cabeçalho enviado pela plataforma para identificar o usuário.
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
// Identifica a codificação do nome recebido pelos cabeçalhos da plataforma.
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
// Caminho reservado ao fluxo de autenticação gerido pela plataforma.
const SIGN_IN_PATH = "/signin-with-chatgpt";
// Caminho reservado ao fluxo de autenticação gerido pela plataforma.
const SIGN_OUT_PATH = "/signout-with-chatgpt";
// Caminho reservado ao fluxo de autenticação gerido pela plataforma.
const CALLBACK_PATH = "/callback";

// Lê a identidade opcional enviada pelos cabeçalhos de autenticação da plataforma.
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  // Somente a hospedagem que autentica estes cabeçalhos pode habilitar a identidade da plataforma.
  // Na Cloudflare pública eles podem ser enviados por visitantes e nunca concedem acesso por padrão.
  const { env } = await import("cloudflare:workers");
  if (env.AUTH_PLATFORM_HEADERS_ENABLED !== "true") return null;

  const requestHeaders = await headers();
  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!userId || !email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    userId,
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

// Exige a identidade da plataforma e redireciona ao login quando ela está ausente.
export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

// Monta o caminho de entrada da plataforma com um destino de retorno seguro.
export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

// Monta o caminho de saída da plataforma com um destino de retorno seguro.
export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

// Valida o caminho de retorno e evita destinos externos ou rotas de autenticação reservadas.
function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

// Identifica caminhos controlados pela autenticação da plataforma.
function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

// Decodifica o cabeçalho de nome sem interromper a página se a codificação for inválida.
function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
