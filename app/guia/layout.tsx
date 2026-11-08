import type { ReactNode } from "react";
import InternalPageLayout from "../internal-page-layout";
import styles from "./layout.module.css";

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <InternalPageLayout>{children}</InternalPageLayout>
    </div>
  );
}
