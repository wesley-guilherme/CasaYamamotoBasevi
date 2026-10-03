"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PartnerCategoryRecord, PartnerRecord } from "../../db/partners";
import styles from "./parceiros.module.css";

export default function PartnerExplorer({ categories, partners }: {
  categories: PartnerCategoryRecord[];
  partners: PartnerRecord[];
}) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isFilterPinned, setIsFilterPinned] = useState(false);
  const filterAnchorRef = useRef<HTMLDivElement | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);
  const visible = useMemo(
    () => categoryId === null ? partners : partners.filter((partner) => partner.categoryId === categoryId),
    [categoryId, partners],
  );

  useEffect(() => {
    let animationFrame: number | null = null;

    const updatePinnedFilter = () => {
      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const anchorTop = filterAnchorRef.current?.getBoundingClientRect().top ?? 0;
      setIsFilterPinned(anchorTop <= headerHeight + 12);
    };

    const scheduleUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        updatePinnedFilter();
      });
    };

    updatePinnedFilter();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div
        className={styles.filterAnchor}
        ref={filterAnchorRef}
        style={{ height: isFilterPinned ? filterBarRef.current?.offsetHeight ?? 0 : 0 }}
      />
      <div
        className={`${styles.filterBar}${isFilterPinned ? ` ${styles.fixedFilterBar}` : ""}`}
        ref={filterBarRef}
      >
        <div className={styles.filters} aria-label="Filtrar parceiros por categoria">
          <button
            aria-pressed={categoryId === null}
            className={categoryId === null ? styles.activeFilter : undefined}
            type="button"
            onClick={() => setCategoryId(null)}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              aria-pressed={categoryId === category.id}
              className={categoryId === category.id ? styles.activeFilter : undefined}
              type="button"
              onClick={() => setCategoryId(category.id)}
              key={category.id}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <strong>{partners.length === 0 ? "Os benefícios serão publicados em breve." : "Nenhum parceiro nesta categoria."}</strong>
          <p>O anfitrião está preparando indicações para aproveitar melhor a estadia.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((partner) => (
            <article className={styles.card} key={partner.id}>
              {partner.imageKey ? (
                <img className={styles.partnerImage} src={`/api/partners/${partner.id}/image`} alt={partner.name} />
              ) : (
                <div className={styles.imageFallback} aria-hidden="true">
                  <svg viewBox="0 0 48 48"><path d="M14 22h20v18H14zM10 15h28v9H10zM24 15v25M17 15c-4-6 3-10 7 0M31 15c4-6-3-10-7 0" /></svg>
                </div>
              )}
              <div className={styles.cardBody}>
                <span className={styles.category}>{partner.categoryName}</span>
                <h2>{partner.name}</h2>
                {partner.description && <p>{partner.description}</p>}
                <dl>
                  <div><dt>Benefício</dt><dd className={styles.benefit}>{partner.benefit}</dd></div>
                  {partner.address && <div><dt>Endereço</dt><dd>{partner.address}</dd></div>}
                  {partner.openingHours && <div><dt>Funcionamento</dt><dd>{partner.openingHours}</dd></div>}
                </dl>
                {(partner.locationUrl || partner.instagramUrl || partner.whatsappUrl) && (
                  <div className={styles.contactActions} aria-label={`Contatos de ${partner.name}`}>
                    {partner.locationUrl && (
                      <a className={`${styles.partnerAction} ${styles.locationAction}`} href={partner.locationUrl} target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
                        <span>Localização</span>
                      </a>
                    )}
                    {partner.instagramUrl && (
                      <a className={`${styles.partnerAction} ${styles.socialAction} ${styles.instagramAction}`} href={partner.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${partner.name}`} title="Instagram">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className={styles.iconDot} /></svg>
                      </a>
                    )}
                    {partner.whatsappUrl && (
                      <a className={`${styles.partnerAction} ${styles.socialAction} ${styles.whatsappAction}`} href={partner.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${partner.name}`} title="WhatsApp">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z" /><path d="M9 8.2c.2-.4.4-.4.7-.4h.5l.8 2c.1.3 0 .5-.2.7l-.6.7c.8 1.6 1.9 2.7 3.5 3.4l.7-.8c.2-.2.4-.3.7-.2l2 .9c.3.1.4.4.3.7-.3 1.2-1.5 2-2.7 2-3.7-.2-7.7-3.8-7.9-7.4 0-.7.7-1.4 1.2-1.6Z" /></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
