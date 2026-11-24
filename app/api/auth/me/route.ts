// API de consulta da identidade e das ações disponíveis para a sessão atual.
import { currentAccount, privateJson } from "../../../account-session";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
// Renderiza a cada requisição para refletir a identidade ou os dados atuais do servidor.
export const dynamic = "force-dynamic";
// Retorna a identidade resumida da conta e os caminhos de acesso e saída disponíveis.
export async function GET(request: Request) {
  try {
    const user = await currentAccount(request);
    return privateJson({ user: user ? { name: user.name, role: user.role, native: user.native, destination: user.role === "host" ? "/admin/agenda" : "/minha-conta", signOut: user.native ? chatGPTSignOutPath("/") : null } : null });
  } catch { return privateJson({ user: null }, 503); }
}
