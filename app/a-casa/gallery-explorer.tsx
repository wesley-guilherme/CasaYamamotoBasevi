"use client";

import { useEffect, useRef, useState } from "react";

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
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const movePhoto = (direction: -1 | 1) => {
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
      <nav className="room-jump-nav shell" aria-label="Ir para um cômodo">
        {rooms.map((room) => (
          <a href={`#${room.slug}`} key={room.slug}>{room.title}</a>
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
              <div>
                <strong>{activeRoom.title}</strong>
                <span>{activePhoto.imageIndex + 1} de {activeRoom.images.length}</span>
              </div>
              <button type="button" aria-label="Fechar" onClick={closeLightbox}>×</button>
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
