// Galeria da casa com fotografias responsivas, navegação por ambientes e ampliação.
"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

// Caminhos e dimensões reais das cópias que o navegador seleciona conforme a tela.
export type GalleryImage = {
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  full: string;
  width: number;
  height: number;
  sources: { src: string; width: number; height: number }[];
};

// Informa as larguras disponíveis para atender telas de alta densidade sem baixar o original.
function galleryImageSrcSet(image: GalleryImage) {
  return image.sources.map((source) => `${source.src} ${source.width}w`).join(", ");
}

// Calcula a resolução também pela altura do recorte, evitando perda de nitidez em cartões estreitos.
function galleryImageSizes(image: GalleryImage, imageIndex: number, photoCount: number) {
  const ratio = image.width / image.height;
  const isFeatured = imageIndex === 0 && photoCount > 1;

  // Reflete a largura, a altura mínima e a proporção dos cartões sem modificar o CSS existente.
  const coveredSize = (width: string, minHeight: number, frameRatio: number) =>
    `max(${width}, calc(${minHeight}px * ${ratio}), calc((${width}) * ${ratio / frameRatio}))`;

  if (photoCount === 1) {
    return `(max-width: 600px) ${coveredSize("calc(100vw - 40px)", 165, 4 / 3)}, ${coveredSize("560px", 250, 4 / 3)}`;
  }

  // O destaque ocupa duas colunas; no desktop a segunda foto compartilha sua altura.
  const mobileWidth = isFeatured ? "calc(100vw - 40px)" : "calc((100vw - 48px) / 2)";
  const tabletWidth = isFeatured ? "calc(100vw - 40px)" : "calc((100vw - 54px) / 2)";
  const desktopWidth = isFeatured ? "calc((100vw - 47px) * 2 / 3)" : "calc((100vw - 68px) / 3)";
  const desktopMaxWidth = isFeatured ? "769px" : "378px";
  const frameRatio = isFeatured ? 16 / 9 : 4 / 3;
  const desktopSize = (width: string, featuredWidth: string) =>
    imageIndex === 1
      ? `max(${coveredSize(width, 250, frameRatio)}, calc((${featuredWidth}) * ${ratio * 9 / 16}))`
      : coveredSize(width, 250, frameRatio);

  return `(max-width: 600px) ${coveredSize(mobileWidth, 165, frameRatio)}, (max-width: 900px) ${coveredSize(tabletWidth, 250, frameRatio)}, (max-width: 1200px) ${desktopSize(desktopWidth, "calc((100vw - 47px) * 2 / 3)")}, ${desktopSize(desktopMaxWidth, "769px")}`;
}

// Considera a altura disponível na ampliação para não baixar uma foto vertical maior que a tela.
function lightboxImageSizes(image: GalleryImage) {
  const ratio = image.width / image.height;
  return `(max-width: 600px) min(calc(100vw - 20px), calc((100dvh - 100px) * ${ratio})), min(1240px, calc(100vw - 60px), calc((100dvh - 150px) * ${ratio}))`;
}

// Identificação, descrição e fotografias de um ambiente da casa.
export type GalleryRoom = {
  slug: string;
  title: string;
  description: string;
  images: GalleryImage[];
};

// Posição da foto aberta dentro do ambiente selecionado.
type ActivePhoto = { roomIndex: number; imageIndex: number };

// Apresenta os ambientes e controla a ampliação e a navegação entre as fotos.
export default function GalleryExplorer({ rooms }: { rooms: GalleryRoom[] }) {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const [activePhoto, setActivePhoto] = useState<ActivePhoto | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [isNavPinned, setIsNavPinned] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const navAnchorRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

  // Troca a foto ampliada e reinicia o zoom ao navegar entre as imagens.
  const movePhoto = (direction: -1 | 1) => {
    setImageScale(1);
    setActivePhoto((current) => {
      if (!current) return current;
      const room = rooms[current.roomIndex];
      return {
        roomIndex: current.roomIndex,
        imageIndex:
          (current.imageIndex + direction + room.images.length) % room.images.length,
      };
    });
  };

  // Fecha a foto ampliada e devolve o foco ao botão que abriu a visualização.
  const closeLightbox = () => {
    setActivePhoto(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  };

  // Sincroniza a interface com a posição da página e cancela eventos ou animações ao desmontar.
  useEffect(() => {
    let animationFrame: number | null = null;

    // Fixa a navegação dos ambientes conforme sua posição em relação ao cabeçalho.
    const updatePinnedNavigation = () => {
      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const anchorTop = navAnchorRef.current?.getBoundingClientRect().top ?? 0;
      setIsNavPinned(anchorTop <= headerHeight + 12);
    };

    // Agrupa atualizações de posição em um único quadro para evitar trabalho repetido.
    const scheduleUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        updatePinnedNavigation();
      });
    };

    updatePinnedNavigation();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Sincroniza o componente com as dependências e executa a limpeza quando necessária.
  useEffect(
    () => () => {
      if (scrollAnimationRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationRef.current);
      }
    },
    [],
  );

  // Leva a navegação ao ambiente escolhido, sem seguir o salto padrão do link.
  function scrollToRoom(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    event.preventDefault();
    const target = document.getElementById(slug);
    if (!target) return;

    if (scrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
    }

    const startPosition = window.scrollY;
    const targetContent =
      target.querySelector<HTMLElement>(".room-heading") ?? target;
    const headerHeight =
      document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
    const navigationHeight = navRef.current?.offsetHeight ?? 0;
    const targetPosition = Math.max(
      0,
      targetContent.getBoundingClientRect().top +
        startPosition -
        headerHeight -
        navigationHeight -
        18,
    );
    const distance = targetPosition - startPosition;
    const duration = Math.min(1000, Math.max(650, Math.abs(distance) * 0.22));
    const startTime = window.performance.now();

    // Aplica a interpolação de movimento e agenda os quadros até alcançar a seção.
    const animateScroll = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * easedProgress);
      if (progress < 1) {
        scrollAnimationRef.current = window.requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationRef.current = null;
        window.history.pushState(null, "", `#${slug}`);
      }
    };

    scrollAnimationRef.current = window.requestAnimationFrame(animateScroll);
  }

  // Controla teclado e rolagem enquanto a interface está aberta e restaura ambos ao fechar.
  useEffect(() => {
    if (!activePhoto) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Trata Escape para fechar a galeria e as setas para navegar entre fotos.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto]);

  const activeRoom = activePhoto ? rooms[activePhoto.roomIndex] : null;
  const activeImage =
    activeRoom && activePhoto ? activeRoom.images[activePhoto.imageIndex] : null;

  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <>
      <div
        className="room-nav-anchor"
        ref={navAnchorRef}
        style={{ height: isNavPinned ? navRef.current?.offsetHeight ?? 0 : 0 }}
      />
      {/* Links e controles de navegação entre as opções disponíveis. */}
      <nav
        className={`room-jump-nav shell${isNavPinned ? " is-fixed" : ""}`}
        aria-label="Ir para um cômodo"
        ref={navRef}
      >
        {rooms.map((room) => (
          <a
            href={`#${room.slug}`}
            key={room.slug}
            onClick={(event) => scrollToRoom(event, room.slug)}
          >
            {room.title}
          </a>
        ))}
      </nav>

      <div className="album-rooms shell">
        {rooms.map((room, roomIndex) => (
          <section className="room-section" id={room.slug} key={room.slug}>
            <div className="room-heading">
              <div>
                <p className="eyebrow">Ambiente</p>
                <h2>{room.title}</h2>
              </div>
              <div>
                <p>{room.description}</p>
                <span>{room.images.length} {room.images.length === 1 ? "foto" : "fotos"}</span>
              </div>
            </div>

            <div className={`room-gallery-grid photos-${room.images.length}`}>
              {room.images.map((image, imageIndex) => (
                <button
                  className="room-photo"
                  type="button"
                  key={image.thumb}
                  aria-label={`Ampliar foto ${imageIndex + 1} de ${room.title}`}
                  onClick={(event) => {
                    lastTrigger.current = event.currentTarget;
                    setImageScale(1);
                    setActivePhoto({ roomIndex, imageIndex });
                  }}
                >
                  {/* Seleciona uma cópia proporcional ao cartão e à densidade da tela, mantendo o recorte do CSS. */}
                  <img
                    src={image.thumb}
                    srcSet={galleryImageSrcSet(image)}
                    sizes={galleryImageSizes(image, imageIndex, room.images.length)}
                    width={image.thumbWidth}
                    height={image.thumbHeight}
                    loading="lazy"
                    decoding="async"
                    alt={`${room.title} — foto ${imageIndex + 1}`}
                  />
                  <span aria-hidden="true">Ampliar</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {activeRoom && activeImage && activePhoto ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Galeria de ${activeRoom.title}`}>
          <button className="lightbox-backdrop" type="button" aria-label="Fechar foto ampliada" onClick={closeLightbox} />
          <div className="lightbox-panel">
            <div className="lightbox-bar">
              <div className="lightbox-title">
                <strong>{activeRoom.title}</strong>
                <span>{activePhoto.imageIndex + 1} de {activeRoom.images.length}</span>
              </div>
              <div className="lightbox-actions">
                <div className="lightbox-zoom-controls" aria-label="Tamanho da foto">
                  <button
                    type="button"
                    aria-label="Diminuir foto"
                    disabled={imageScale <= 0.6}
                    onClick={() => setImageScale((scale) => Math.max(0.6, scale - 0.1))}
                  >
                    −
                  </button>
                  <output aria-live="polite">{Math.round(imageScale * 100)}%</output>
                  <button
                    type="button"
                    aria-label="Aumentar foto"
                    disabled={imageScale >= 1}
                    onClick={() => setImageScale((scale) => Math.min(1, scale + 0.1))}
                  >
                    +
                  </button>
                </div>
                <button className="lightbox-close" type="button" aria-label="Fechar" onClick={closeLightbox}>×</button>
              </div>
            </div>
            <div className="lightbox-stage">
              {activeRoom.images.length > 1 ? (
                <button className="lightbox-arrow previous" type="button" aria-label="Foto anterior" onClick={() => movePhoto(-1)}>‹</button>
              ) : null}
              {/* Carrega a versão adequada à ampliação e mantém a fotografia inteira no painel. */}
              <img
                src={activeImage.full}
                srcSet={galleryImageSrcSet(activeImage)}
                sizes={lightboxImageSizes(activeImage)}
                width={activeImage.width}
                height={activeImage.height}
                alt={`${activeRoom.title} — foto ${activePhoto.imageIndex + 1}`}
                style={{ transform: `scale(${imageScale})` }}
              />
              {activeRoom.images.length > 1 ? (
                <button className="lightbox-arrow next" type="button" aria-label="Próxima foto" onClick={() => movePhoto(1)}>›</button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
