// Resolução do anfitrião autorizado para as rotas administrativas.
// Compatibility import for existing administrative APIs. Shared test
// passwords are retired; every caller now uses individual authorization.
import { hostActor } from "./account-session";
// Resolve o anfitrião autorizado para as operações administrativas.
export async function getAdminActor(request?: Request): Promise<string | null> {
  if (!request) return null;
  return (await hostActor(request))?.email ?? null;
}
