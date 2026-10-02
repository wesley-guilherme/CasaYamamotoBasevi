import { GUEST_ACCESS_COOKIE, safeReturnTo } from "../guest-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo") ?? "/");
  const response = Response.redirect(new URL(returnTo, url.origin), 303);
  response.headers.set(
    "Set-Cookie",
    `${GUEST_ACCESS_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
  );
  return response;
}
