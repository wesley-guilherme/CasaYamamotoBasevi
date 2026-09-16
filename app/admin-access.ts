import type { ChatGPTUser } from "./chatgpt-auth";

export const ADMIN_EMAIL = "casayamamotobasevi@gmail.com";

export function isAdminUser(user: ChatGPTUser | null): user is ChatGPTUser {
  return user?.email.trim().toLowerCase() === ADMIN_EMAIL;
}
