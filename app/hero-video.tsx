"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, []);

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

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

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
