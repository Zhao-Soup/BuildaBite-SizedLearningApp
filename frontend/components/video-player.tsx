'use client';

import { useEffect, useRef } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

function isExternalEmbed(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return /youtube\.com|youtu\.be|instagram\.com|facebook\.com/.test(parsed.hostname);
  } catch {
    return false;
  }
}

export function VideoPlayer({ src, poster, autoPlay, loop }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

  // If the src is a full YouTube/Instagram URL, render an iframe instead of using Video.js
  if (isExternalEmbed(src)) {
    let finalSrc = src;
    if (autoPlay || loop) {
      const hasQuery = src.includes("?");
      const extra = "autoplay=1&mute=1&loop=1";
      finalSrc = `${src}${hasQuery ? "&" : "?"}${extra}`;
    }
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <iframe
          className="h-full w-full"
          src={finalSrc}
          title="Embedded short video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: !!autoPlay,
      preload: "auto",
      loop: !!loop,
      sources: [{ src, type: "video/mp4" }]
    });

    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, [src]);

  return (
    <div data-vjs-player className="h-full">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered h-full w-full"
        controls
        autoPlay={autoPlay}
        loop={loop}
        muted={autoPlay}
        playsInline
        poster={poster}
      />
    </div>
  );
}



