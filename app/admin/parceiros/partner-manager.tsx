"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { PartnerCategoryRecord, PartnerRecord } from "../../../db/partners";
import base from "../eventos/eventos.module.css";
import styles from "./parceiros.module.css";
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE, readWhatsAppLink } from "./whatsapp-link";

type PartnerDraft = Pick<PartnerRecord, "categoryId" | "name" | "description" | "address" | "benefit" | "openingHours" | "locationUrl" | "instagramUrl" | "whatsappUrl" | "published">;
const blankDraft: PartnerDraft = { categoryId: 0, name: "", description: "", address: "", benefit: "", openingHours: "", locationUrl: null, instagramUrl: null, whatsappUrl: null, published: false };

function imageSource(partner: PartnerRecord) {
  return partner.imageKey ? `/api/partners/${partner.id}/image?updated=${encodeURIComponent(partner.updatedAt)}` : null;
}

export default function PartnerManager({ initialCategories, initialPartners, loadError }: {
  initialCategories: PartnerCategoryRecord[];
  initialPartners: PartnerRecord[];
  loadError: string | null;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [partners, setPartners] = useState(initialPartners);
  const [draft, setDraft] = useState<PartnerDraft>({ ...blankDraft, categoryId: initialCategories.find((item) => item.active)?.id ?? 0 });
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState(DEFAULT_WHATSAPP_MESSAGE);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [status, setStatus] = useState<string | null>(loadError);
  const [saving, setSaving] = useState(false);

  const selected = partners.find((partner) => partner.id === editingId);
  const currentImage = removeImage ? null : imagePreview ?? (selected ? imageSource(selected) : null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return partners.filter((partner) =>
      (!query || `${partner.name} ${partner.categoryName} ${partner.benefit}`.toLocaleLowerCase("pt-BR").includes(query)) &&
      (!categoryFilter || partner.categoryId === categoryFilter) &&
      (statusFilter === "all" || (statusFilter === "published") === partner.published),
    );
  }, [partners, search, categoryFilter, statusFilter]);

  function updateDraft<K extends keyof PartnerDraft>(key: K, value: PartnerDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function updateWhatsApp(phone: string, message: string) {
    setWhatsappPhone(phone);
    setWhatsappMessage(message);
    updateDraft("whatsappUrl", buildWhatsAppLink(phone, message));
  }
  function resetForm() {
    setEditingId(null);
    setDraft({ ...blankDraft, categoryId: categories.find((item) => item.active)?.id ?? 0 });
    setWhatsappPhone("");
    setWhatsappMessage(DEFAULT_WHATSAPP_MESSAGE);
    setImageFile(null);
    setRemoveImage(false);
  }
  function startEditing(partner: PartnerRecord) {
    const whatsapp = readWhatsAppLink(partner.whatsappUrl);
    setEditingId(partner.id);
    setDraft({ categoryId: partner.categoryId, name: partner.name, description: partner.description, address: partner.address, benefit: partner.benefit, openingHours: partner.openingHours, locationUrl: partner.locationUrl, instagramUrl: partner.instagramUrl, whatsappUrl: partner.whatsappUrl, published: partner.published });
    setWhatsappPhone(whatsapp.phone);
    setWhatsappMessage(whatsapp.message);
    setImageFile(null);
    setRemoveImage(false);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function selectImage(file: File | null) {
    if (file && (!(["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setStatus("Envie uma imagem JPG, PNG ou WebP de até 5 MB.");
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
    setStatus(null);
  }

  async function savePartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch(editingId ? `/api/admin/partners/${editingId}` : "/api/admin/partners", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json() as { partner?: PartnerRecord; error?: string };
      if (!response.ok || !result.partner) throw new Error(result.error ?? "Não foi possível salvar.");
      let saved = result.partner;
      if (imageFile) {
        const upload = await fetch(`/api/partners/${saved.id}/image`, { method: "PUT", headers: { "Content-Type": imageFile.type }, body: imageFile });
        const uploadResult = await upload.json() as { imageUrl?: string; error?: string };
        if (!upload.ok) throw new Error(`Parceiro salvo, mas a imagem falhou: ${uploadResult.error ?? "tente novamente"}`);
        saved = { ...saved, imageKey: "uploaded", updatedAt: new Date().toISOString() };
      } else if (removeImage && editingId) {
        const removal = await fetch(`/api/partners/${saved.id}/image`, { method: "DELETE" });
        if (!removal.ok) throw new Error("Parceiro salvo, mas não foi possível remover a imagem.");
        saved = { ...saved, imageKey: null };
      }
      setPartners((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      const wasEditing = editingId !== null;
      resetForm();
      setStatus(wasEditing ? "Parceiro atualizado com sucesso." : "Parceiro cadastrado com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível salvar o parceiro.");
    } finally {
      setSaving(false);
    }
  }

  async function removePartner(partner: PartnerRecord) {
    if (!window.confirm(`Excluir “${partner.name}”?`)) return;
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível excluir.");
      setPartners((current) => current.filter((item) => item.id !== partner.id));
      if (editingId === partner.id) resetForm();
      setStatus("Parceiro excluído.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível excluir o parceiro.");
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/partner-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: categoryName }) });
      const result = await response.json() as { category?: PartnerCategoryRecord; error?: string };
      if (!response.ok || !result.category) throw new Error(result.error ?? "Não foi possível criar a categoria.");
      setCategories((current) => [...current, result.category!]);
      if (!draft.categoryId) updateDraft("categoryId", result.category.id);
      setCategoryName("");
      setStatus("Categoria cadastrada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível criar a categoria.");
    }
  }

  async function editCategory(category: PartnerCategoryRecord) {
    const name = window.prompt("Novo nome da categoria:", category.name)?.trim();
    if (!name || name === category.name) return;
    await updateCategory(category, { name, active: category.active });
  }
  async function toggleCategory(category: PartnerCategoryRecord) {
    await updateCategory(category, { name: category.name, active: !category.active });
  }
  async function updateCategory(category: PartnerCategoryRecord, input: { name: string; active: boolean }) {
    try {
      const response = await fetch(`/api/admin/partner-categories/${category.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const result = await response.json() as { category?: PartnerCategoryRecord; error?: string };
      if (!response.ok || !result.category) throw new Error(result.error ?? "Não foi possível atualizar.");
      setCategories((current) => current.map((item) => item.id === category.id ? result.category! : item));
      setPartners((current) => current.map((partner) => partner.categoryId === category.id ? { ...partner, categoryName: result.category!.name, categorySlug: result.category!.slug } : partner));
      setStatus("Categoria atualizada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível atualizar a categoria.");
    }
  }
  async function removeCategory(category: PartnerCategoryRecord) {
    if (!window.confirm(`Excluir a categoria “${category.name}”?`)) return;
    try {
      const response = await fetch(`/api/admin/partner-categories/${category.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível excluir.");
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setStatus("Categoria excluída.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível excluir a categoria.");
    }
  }

  return (
    <>
      <section className={styles.categoryPanel} aria-labelledby="categories-title">
        <div><span className={base.eyebrow}>Organização</span><h2 id="categories-title">Categorias</h2><p>As categorias ativas aparecem como filtros na área do hóspede.</p></div>
        <form onSubmit={addCategory}><label htmlFor="new-category">Nova categoria</label><div><input id="new-category" required minLength={2} maxLength={80} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Ex.: Experiências náuticas" /><button type="submit">Cadastrar</button></div></form>
        <div className={styles.categoryList}>{categories.map((category) => <div className={!category.active ? styles.inactiveCategory : undefined} key={category.id}><span><strong>{category.name}</strong><small>{category.active ? "Ativa" : "Oculta"}</small></span><span className={styles.categoryActions}><button type="button" onClick={() => editCategory(category)}>Renomear</button><button type="button" onClick={() => toggleCategory(category)}>{category.active ? "Ocultar" : "Ativar"}</button><button type="button" onClick={() => removeCategory(category)}>Excluir</button></span></div>)}</div>
      </section>

      <div className={base.managerGrid}>
        <form className={base.eventForm} onSubmit={savePartner}>
          <div className={base.formHeading}><div><span className={base.eyebrow}>{editingId ? "Editando" : "Novo parceiro"}</span><h2>{editingId ? "Atualize o benefício" : "Cadastre um parceiro"}</h2></div>{editingId && <button type="button" className={base.cancelButton} onClick={() => { resetForm(); setStatus(null); }}>Cancelar</button>}</div>
          <label>Nome do parceiro<input required maxLength={120} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></label>
          <label>Categoria<select required value={draft.categoryId || ""} onChange={(event) => updateDraft("categoryId", Number(event.target.value))}><option value="" disabled>Selecione</option>{categories.filter((category) => category.active || category.id === draft.categoryId).map((category) => <option key={category.id} value={category.id}>{category.name}{category.active ? "" : " (oculta)"}</option>)}</select></label>
          <label>Descrição para o hóspede<textarea maxLength={700} rows={4} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} /></label>
          <label>Benefício oferecido<input required maxLength={300} placeholder="Ex.: 10% de desconto no consumo" value={draft.benefit} onChange={(event) => updateDraft("benefit", event.target.value)} /></label>
          <label>Endereço<input maxLength={240} value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} /></label>
          <label>Funcionamento<input maxLength={240} placeholder="Ex.: terça a domingo, das 18h às 23h" value={draft.openingHours} onChange={(event) => updateDraft("openingHours", event.target.value)} /></label>
          <label>Link de localização <span className={base.optional}>(opcional)</span><input type="url" inputMode="url" placeholder="https://maps.google.com/..." value={draft.locationUrl ?? ""} onChange={(event) => updateDraft("locationUrl", event.target.value || null)} /></label>
          <label>Link do Instagram <span className={base.optional}>(opcional)</span><input type="url" inputMode="url" placeholder="https://instagram.com/..." value={draft.instagramUrl ?? ""} onChange={(event) => updateDraft("instagramUrl", event.target.value || null)} /></label>
          <fieldset className={styles.whatsappBuilder}>
            <legend>WhatsApp do parceiro <span className={base.optional}>(opcional)</span></legend>
            <div className={styles.whatsappFields}>
              <label>Número com DDD<input type="tel" inputMode="tel" maxLength={22} placeholder="Ex.: (73) 99937-0351" value={whatsappPhone} onChange={(event) => updateWhatsApp(event.target.value, whatsappMessage)} /></label>
              <label>Mensagem pronta<textarea rows={3} maxLength={240} value={whatsappMessage} onChange={(event) => updateWhatsApp(whatsappPhone, event.target.value)} /></label>
            </div>
            <p className={styles.whatsappHint}>Ao informar DDD + número, o código do Brasil (55) é acrescentado automaticamente.</p>
            {draft.whatsappUrl ? (
              <div className={styles.whatsappPreview}>
                <span><strong>Link pronto</strong><code>{draft.whatsappUrl}</code></span>
                <a href={draft.whatsappUrl} target="_blank" rel="noopener noreferrer">Testar link</a>
              </div>
            ) : (
              <p className={styles.whatsappEmpty}>Digite o número para gerar o link automaticamente.</p>
            )}
          </fieldset>
          <label>Foto do parceiro <span className={base.optional}>(opcional)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} /></label>
          <p className={base.fieldHint}>JPG, PNG ou WebP · até 5 MB</p>
          {currentImage && <div className={styles.imagePreview}><img src={currentImage} alt="Prévia da foto do parceiro" /><button type="button" onClick={() => { setImageFile(null); setRemoveImage(true); }}>Remover foto</button></div>}
          <label className={base.publishToggle}><input type="checkbox" checked={draft.published} onChange={(event) => updateDraft("published", event.target.checked)} /><span><strong>Publicar para hóspedes</strong><small>Desmarque para manter como rascunho.</small></span></label>
          {status && <p className={base.formStatus} role="status">{status}</p>}
          <button className={base.primaryButton} type="submit" disabled={saving}>{saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar parceiro"}</button>
        </form>

        <section className={base.eventList} aria-labelledby="partners-title">
          <div className={base.listHeading}><div><span className={base.eyebrow}>Cadastros</span><h2 id="partners-title">Parceiros</h2></div><span className={base.counter}>{partners.length}</span></div>
          <div className={`${base.listFilters} ${styles.listFilters}`}><label>Buscar<input type="search" placeholder="Nome, categoria ou benefício" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label>Categoria<select value={categoryFilter} onChange={(event) => setCategoryFilter(Number(event.target.value))}><option value={0}>Todas</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select></label></div>
          <p className={base.resultCount}>{visible.length} {visible.length === 1 ? "parceiro encontrado" : "parceiros encontrados"}</p>
          {visible.length === 0 ? <div className={base.emptyState}><strong>{partners.length === 0 ? "Nenhum parceiro cadastrado." : "Nenhum parceiro neste filtro."}</strong><p>{partners.length === 0 ? "Use o formulário para cadastrar o primeiro benefício." : "Tente outro nome, categoria ou status."}</p></div> : <div className={styles.partnerRows}>{visible.map((partner) => <article className={styles.partnerRow} key={partner.id}>{partner.imageKey ? <img src={imageSource(partner)!} alt="" /> : <div className={styles.rowIcon} aria-hidden="true">+</div>}<div><span className={styles.rowMeta}>{partner.categoryName}</span><strong>{partner.name}</strong><p>{partner.benefit}</p></div><span className={partner.published ? base.published : base.draft}>{partner.published ? "Publicado" : "Rascunho"}</span><div className={base.rowActions}><button type="button" className={base.secondaryButton} onClick={() => startEditing(partner)}>Editar</button><button type="button" className={base.dangerButton} onClick={() => removePartner(partner)}>Excluir</button></div></article>)}</div>}
        </section>
      </div>
    </>
  );
}
