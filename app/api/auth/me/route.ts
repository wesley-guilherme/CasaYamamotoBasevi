import { currentAccount, privateJson } from "../../../account-session";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const user = await currentAccount(request);
    return privateJson({ user: user ? { name: user.name, role: user.role, native: user.native, destination: user.role === "host" ? "/admin/agenda" : "/minha-conta", signOut: user.native ? chatGPTSignOutPath("/") : null } : null });
  } catch { return privateJson({ user: null }, 503); }
}
