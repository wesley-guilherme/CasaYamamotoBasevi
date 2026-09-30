"use client";

import { useMemo, useState } from "react";
import type { PartnerCategoryRecord, PartnerRecord } from "../../db/partners";
import styles from "./parceiros.module.css";

export default function PartnerExplorer({ categories, partners }: {
  categories: PartnerCategoryRecord[];
  partners: PartnerRecord[];
}) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const visible = useMemo(
    () => categoryId === null ? partners : partners.filter((partner) => partner.categoryId === categoryId),
    [categoryId, partners],
  );

  return (
    <>
      <div className={styles.filters} aria-label="Filtrar parceiros por categoria">
        <button className={categoryId === null ? styles.activeFilter : undefined} type="button" onClick={() => setCategoryId(null)}>Todos</button>
        {categories.map((category) => (
          <button
            className={categoryId === category.id ? styles.activeFilter : undefined}
            type="button"
            onClick={() => setCategoryId(category.id)}
            key={category.id}
          >
            {category.name}
          </button>
        ))}
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
                {partner.contactUrl && (
                  <a className={styles.partnerLink} href={partner.contactUrl} target="_blank" rel="noopener noreferrer">Abrir contato ou localização</a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
