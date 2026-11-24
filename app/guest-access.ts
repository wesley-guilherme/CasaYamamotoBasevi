// Proteção das páginas de benefícios conforme a conta e a estadia vigente.
import { redirect } from "next/navigation";
import { canSeeBenefits, currentAccount } from "./account-session";
import { safeDestination } from "./auth-policy";
// Reutiliza a validação de destino interno para preservar compatibilidade entre chamadas.
export const safeReturnTo = safeDestination;
// Reutiliza a verificação de benefícios para identificar requisições com acesso permitido.
export const isGuestRequest = canSeeBenefits;
// Exige permissão para benefícios e encaminha a conta ou o visitante ao destino adequado.
export async function requireGuestAccess(returnTo: string): Promise<void> {
  if (await canSeeBenefits()) return;
  if (await currentAccount()) redirect("/minha-conta");
  redirect(`/login?returnTo=${encodeURIComponent(safeDestination(returnTo))}`);
}
