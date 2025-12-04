"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";

type Video = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  video_url: string;
};

const PLAYLIST_KEY = "bite-sized-playlist";

export default function PlaylistPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored: Video[] = JSON.parse(window.localStorage.getItem(PLAYLIST_KEY) || "[]");
    setVideos(stored);
  }, []);

  const clear = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PLAYLIST_KEY);
    setVideos([]);
  };

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-sm">
        <p>Your playlist is empty. Save videos from the Learn page.</p>
        <Link href="/feed" className="underline text-accent">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your playlist</h1>
        <Button variant="ghost" className="text-xs" onClick={clear}>
          Clear playlist
        </Button>
      </div>
      <div className="space-y-3">
        {videos.map(video => (
          <div
            key={video.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-card px-4 py-3"
          >
            <div>
              <h2 className="text-sm font-medium mb-1">{video.title}</h2>
              {video.description && (
                <p className="text-xs text-slate-300 line-clamp-2">{video.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {video.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <Link href={`/learn/${video.id}`}>
              <Button variant="secondary" className="text-xs px-3 py-1">
                Continue
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}



