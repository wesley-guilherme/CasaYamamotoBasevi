"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";

export type GalleryImage = {
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  full: string;
  width: number;
  height: number;
};

export type GalleryRoom = {
  slug: string;
  title: string;
  description: string;
  images: GalleryImage[];
};

type ActivePhoto = { roomIndex: number; imageIndex: number };

export default function GalleryExplorer({ rooms }: { rooms: GalleryRoom[] }) {
  const [activePhoto, setActivePhoto] = useState<ActivePhoto | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [isNavPinned, setIsNavPinned] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const navAnchorRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

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

  const closeLightbox = () => {
    setActivePhoto(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  };

  useEffect(() => {
    let animationFrame: number | null = null;

    const updatePinnedNavigation = () => {
      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const anchorTop = navAnchorRef.current?.getBoundingClientRect().top ?? 0;
      setIsNavPinned(anchorTop <= headerHeight + 12);
    };

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

  useEffect(
    () => () => {
      if (scrollAnimationRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationRef.current);
      }
    },
    [],
  );

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

  useEffect(() => {
    if (!activePhoto) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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

  return (
    <>
      <div
        className="room-nav-anchor"
        ref={navAnchorRef}
        style={{ height: isNavPinned ? navRef.current?.offsetHeight ?? 0 : 0 }}
      />
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
                  <img
                    src={image.thumb}
                    width={image.thumbWidth}
                    height={image.thumbHeight}
                    loading="lazy"
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
              <img
                src={activeImage.full}
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
