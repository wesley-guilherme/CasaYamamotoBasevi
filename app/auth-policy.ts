// Regras de permissões, validação de senha e proteção de destinos e requisições.
// Papéis reconhecidos pelas regras de acesso de contas do site.
export type AccountRole = "host" | "guest" | "partner";

// Calcula as ações permitidas conforme o papel, a propriedade e a conta de destino.
export function accountPermissions(actor: { id: string; role: AccountRole; owner: boolean }, account: { id: string; role: AccountRole }) {
  const host = actor.role === "host";
  // Guest access is managed by the host group, independently of its creator.
  const managesGuest = host && account.role === "guest";
  return {
    edit: managesGuest,
    sendEmail: host && (actor.owner || managesGuest) && account.role !== "partner",
    changeStatus: host && (actor.owner || managesGuest) && account.id !== actor.id,
  };
}

// Remove espaços, converte o e-mail para minúsculas e valida seu formato e tamanho.
export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") throw new Error("Informe um e-mail válido.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  return email;
}

// Aceita apenas destinos internos permitidos e usa uma alternativa para entradas inválidas.
export function safeDestination(value: unknown, fallback = "/parceiros"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || /^\/(api|login|logout|signin-with-chatgpt|signout-with-chatgpt|callback)(\/|$)/.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}

// Avalia o comprimento e os grupos de caracteres exigidos para a senha.
export function passwordRequirements(value: string) {
  return [
    { label: "De 8 a 12 caracteres", met: value.length >= 8 && value.length <= 12 },
    { label: "Pelo menos 1 letra maiúscula", met: /\p{Lu}/u.test(value) },
    { label: "Pelo menos 1 número", met: /[0-9]/.test(value) },
    { label: "Pelo menos 1 caractere especial (ex.: ! @ #)", met: /[\p{P}\p{S}]/u.test(value) },
  ];
}

// Retorna a orientação de senha quando algum requisito não foi atendido.
export function passwordError(value: unknown): string | null {
  return typeof value !== "string" || passwordRequirements(value).some(requirement => !requirement.met)
    ? "Use de 8 a 12 caracteres, com pelo menos 1 letra maiúscula, 1 número e 1 caractere especial."
    : null;
}

// Define a página inicial como destino após a autenticação.
export function destinationFor(_role: AccountRole, _value?: unknown): string {
  return "/";
}

// Exige origem igual à do site e rejeita alterações identificadas como cross-site.
export function sameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site";
}
