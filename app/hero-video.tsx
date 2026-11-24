// Apresentação e controle do vídeo de destaque da página inicial.
"use client";

import { useEffect, useRef, useState } from "react";

// Controla a apresentação do vídeo principal e o comportamento de reprodução.
export default function HeroVideo() {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Pausa a reprodução inicial quando o dispositivo indica preferência por menos movimento.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, []);

  // Alterna entre pausa e reprodução e trata a recusa de reprodução pelo navegador.
  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  // Alterna o áudio do vídeo e sincroniza o estado do botão de som.
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <div className="hero-video">
      <div className="hero-video-backdrop" aria-hidden="true" />
      <video
        ref={videoRef}
        className="hero-main-video"
        src="/videos/casa-yamamoto.mp4"
        poster="/videos/casa-yamamoto-poster.webp"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        aria-label="Vista aérea da praia e da região da Casa Yamamoto Basevi"
      >
        Seu navegador não oferece suporte à reprodução deste vídeo.
      </video>
      <div className="hero-video-controls" aria-label="Controles do vídeo">
        <button
          className="hero-video-control"
          type="button"
          aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
          aria-pressed={!isPlaying}
          onClick={togglePlayback}
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        </button>
        <button
          className="hero-video-control"
          type="button"
          aria-label={isMuted ? "Ativar som" : "Silenciar vídeo"}
          aria-pressed={isMuted}
          onClick={toggleMute}
        >
          <span aria-hidden="true">{isMuted ? "🔊" : "🔇"}</span>
        </button>
      </div>
    </div>
  );
}
