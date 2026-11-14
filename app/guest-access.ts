import { redirect } from "next/navigation";
import { canSeeBenefits, currentAccount } from "./account-session";
import { safeDestination } from "./auth-policy";
export const safeReturnTo = safeDestination;
export const isGuestRequest = canSeeBenefits;
export async function requireGuestAccess(returnTo: string): Promise<void> {
  if (await canSeeBenefits()) return;
  if (await currentAccount()) redirect("/minha-conta");
  redirect(`/login?returnTo=${encodeURIComponent(safeDestination(returnTo))}`);
}
