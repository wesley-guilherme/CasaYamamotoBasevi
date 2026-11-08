import type { ReactNode } from "react";
import SiteFooter from "./site-footer";

export default function InternalPageLayout({ children }: { children: ReactNode }) {
  return <>{children}<SiteFooter /></>;
}
