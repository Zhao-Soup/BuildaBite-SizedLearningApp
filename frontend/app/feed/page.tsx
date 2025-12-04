"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VideoPlayer } from "../../components/video-player";
import { useAuth } from "../../components/auth-context";
import { Button } from "../../components/ui/button";
import { apiFetch } from "../../lib/api";

type Video = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  tags: string[];
  skill_level: string;
  video_url: string;
  views: number;
  likes: number;
};

type RecommendationResponse = { video_ids: string[] };

const DEMO_VIDEOS: Video[] = [
  {
    id: "demo-1",
    creator_id: "demo",
    title: "Quick neural networks intuition",
    description: "A 60-second visual explanation of perceptrons.",
    tags: ["ai", "neural-networks", "shorts"],
    skill_level: "intermediate",
    video_url: "https://www.youtube.com/embed/aircAruvnKk",
    views: 1280,
    likes: 240
  },
  {
    id: "demo-2",
    creator_id: "demo",
    title: "Big O in 60 seconds",
    description: "Learn Big O notation with quick visuals.",
    tags: ["algorithms", "complexity", "shorts"],
    skill_level: "beginner",
    video_url: "https://www.youtube.com/embed/D6xkbGLQesk",
    views: 980,
    likes: 180
  },
  {
    id: "demo-3",
    creator_id: "demo",
    title: "JavaScript closures explained",
    description: "Understand closures with a tiny example.",
    tags: ["javascript", "functions"],
    skill_level: "intermediate",
    video_url: "https://www.youtube.com/embed/3a0I8ICR1Vg",
    views: 760,
    likes: 150
  }
];

export default function FeedPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let fromBackend: Video[] | null = null;
        try {
          let ids: string[] | null = null;
          try {
            const historyTags: string[] =
              typeof window !== "undefined"
                ? JSON.parse(window.localStorage.getItem("bite-sized-history-tags") || "[]")
                : [];
            const rec = await apiFetch<RecommendationResponse>("/ai/recommend-feed", {
              method: "POST",
              body: JSON.stringify({ recent_tags: historyTags })
            });
            ids = rec.video_ids;
          } catch {
            // ignore
          }

          if (ids && ids.length) {
            const fetched: Video[] = [];
            for (const id of ids) {
              try {
                const v = await apiFetch<Video>(`/videos/${id}`);
                fetched.push(v);
              } catch {
                // skip
              }
            }
            fromBackend = fetched;
          } else {
            fromBackend = await apiFetch<Video[]>("/videos/feed");
          }
        } catch {
          fromBackend = null;
        }

        const finalVideos = fromBackend && fromBackend.length ? fromBackend : DEMO_VIDEOS;
        setVideos(finalVideos);
        if (finalVideos.length) {
          setActiveId(finalVideos[0].id.toString());
        }
      } catch (e: any) {
        setError(e.message || "Failed to load feed");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      entries => {
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-video-id");
          if (!id) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestId = id;
          }
        }
        if (bestId && bestRatio > 0.55) {
          setActiveId(bestId);
        }
      },
      { threshold: [0.3, 0.55, 0.8] }
    );

    itemRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading feed...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-red-400 text-sm">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="reel-container">
      {videos.map((video, index) => (
        <article
          key={video.id}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          data-video-id={video.id.toString()}
          className="reel relative"
        >
          <VideoPlayer src={video.video_url} autoPlay={activeId === video.id.toString()} loop />
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-sm">
            <h2 className="font-semibold text-base mb-1">{video.title}</h2>
            {video.description && (
              <p className="text-xs text-slate-200 line-clamp-2 mb-1">{video.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mb-2">
              {video.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>
                {video.views} views · {video.likes} likes
              </span>
              <Link href={`/learn/${video.id}`} className="underline">
                Open lesson
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}



