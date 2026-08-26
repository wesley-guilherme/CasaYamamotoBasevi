import type { Metadata } from "next";
import GalleryExplorer, { type GalleryRoom } from "./gallery-explorer";
import manifest from "./gallery-manifest.json";

export const metadata: Metadata = {
  title: "Conheça a casa | Casa Yamamoto Basevi",
  description: "Veja os ambientes, as quatro suítes, a piscina e as áreas de convivência da Casa Yamamoto Basevi em Prado, Bahia.",
};

const roomDetails: Record<string, { title: string; description: string; order: number }> = {
  piscina: { title: "Piscina", description: "Área de lazer privativa para aproveitar os dias de sol com tranquilidade.", order: 1 },
  "area-gourmet": { title: "Área gourmet", description: "Cozinha, churrasqueira e uma grande mesa para reunir todo o grupo.", order: 2 },
  "sala-de-estar": { title: "Sala de estar", description: "Ambiente climatizado para descansar, conversar ou assistir televisão.", order: 3 },
  "suite-1": { title: "Suíte 1", description: "Acomodação climatizada, preparada para receber a família com conforto.", order: 4 },
  "suite-2": { title: "Suíte 2", description: "Espaço privativo, iluminado e equipado para uma estadia tranquila.", order: 5 },
  "suite-3": { title: "Suíte 3", description: "Conforto e praticidade para os hóspedes descansarem depois da praia.", order: 6 },
  "suite-4": { title: "Suíte 4", description: "Suíte climatizada com banheiro privativo e espaço para a família.", order: 7 },
  "banheiro-externo": { title: "Banheiro externo", description: "Apoio prático para a área de convivência e para os momentos de lazer.", order: 8 },
  garagem: { title: "Garagem", description: "Área interna com espaço para estacionar até três veículos.", order: 9 },
};

const rooms: GalleryRoom[] = manifest
  .map((room) => ({
    slug: room.slug,
    title: roomDetails[room.slug]?.title ?? room.sourceFolder,
    description: roomDetails[room.slug]?.description ?? "Conheça este ambiente da casa.",
    order: roomDetails[room.slug]?.order ?? 99,
    images: room.images,
  }))
  .sort((a, b) => a.order - b.order);

export default function HouseGalleryPage() {
  const photoCount = rooms.reduce((total, room) => total + room.images.length, 0);

  return (
    <main className="album-page">
      <a className="skip-link" href="#album-conteudo">Pular para as fotos</a>
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/">
            <span className="brand-name-text"><span>Casa</span> <span>Yamamoto</span> <span>Basevi</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>

      <section className="album-hero">
        <div className="shell album-hero-grid">
          <div>
            <a className="album-breadcrumb" href="/">Início</a>
            <p className="eyebrow">Conheça a casa</p>
            <h1>Espaços feitos para descansar e viver bons momentos juntos.</h1>
            <p className="hero-text">Percorra cada ambiente da Casa Yamamoto Basevi e veja onde sua próxima estadia pode acontecer.</p>
            <div className="album-summary" aria-label="Resumo do álbum">
              <span><strong>{rooms.length}</strong> ambientes</span>
              <span><strong>{photoCount}</strong> fotos</span>
              <span><strong>4</strong> suítes</span>
            </div>
          </div>
          <figure className="album-hero-photo">
            <img src="/images/casa/piscina/02-full.webp" width="2200" height="1238" fetchPriority="high" alt="Piscina privativa e área interna da Casa Yamamoto Basevi" />
          </figure>
        </div>
      </section>

      <div id="album-conteudo"><GalleryExplorer rooms={rooms} /></div>

      <section className="album-contact">
        <div className="shell">
          <p className="eyebrow eyebrow-light">Gostou da casa?</p>
          <h2>Consulte as datas para sua próxima viagem a Prado.</h2>
          <a className="button button-light" href="/#contato">Consultar disponibilidade</a>
        </div>
      </section>
      <footer>
        <div className="shell footer-bottom album-footer">
          <span>© 2026 Casa Yamamoto Basevi</span>
          <a href="/">Voltar para a página inicial</a>
        </div>
      </footer>
    </main>
  );
}
