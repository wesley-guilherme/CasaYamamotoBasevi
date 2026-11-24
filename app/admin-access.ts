// Identificação do administrador principal da Casa Yamamoto Basevi.
import type { ChatGPTUser } from "./chatgpt-auth";

// E-mail usado para reconhecer a identidade administrativa principal.
export const ADMIN_EMAIL = "casayamamotobasevi@gmail.com";

// Reconhece a identidade administrativa pelo e-mail normalizado.
export function isAdminUser(user: ChatGPTUser | null): user is ChatGPTUser {
  return user?.email.trim().toLowerCase() === ADMIN_EMAIL;
}
