"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VideoPlayer } from "../../../components/video-player";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../components/auth-context";
import { apiFetch } from "../../../lib/api";

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

type SummaryResponse = { summary: string; key_points: string[] };
type QuizQuestion = { question: string; options: string[]; answer: string };

const PLAYLIST_KEY = "bite-sized-playlist";
const HISTORY_TAGS_KEY = "bite-sized-history-tags";

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

export default function LearnPage() {
  const params = useParams<{ videoId: string }>();
  const videoId = params.videoId;
  const { token, userId } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      let v: Video | null = null;
      // If this is a demo video, use local data instead of backend
      if (typeof videoId === "string" && videoId.startsWith("demo-")) {
        v = DEMO_VIDEOS.find(d => d.id === videoId) ?? null;
      } else {
        try {
          v = await apiFetch<Video>(`/videos/${videoId}`);
        } catch {
          // if backend fails, fall back to first demo video
          v = DEMO_VIDEOS[0] ?? null;
        }
      }
      if (!v) return;

      setVideo(v);
      // record tags in simple history for recommendations
      if (typeof window !== "undefined") {
        const existing: string[] = JSON.parse(
          window.localStorage.getItem(HISTORY_TAGS_KEY) || "[]"
        );
        const next = Array.from(new Set([...existing, ...(v.tags || [])])).slice(-20);
        window.localStorage.setItem(HISTORY_TAGS_KEY, JSON.stringify(next));
      }
      // check playlist
      if (typeof window !== "undefined") {
        const stored: Video[] = JSON.parse(
          window.localStorage.getItem(PLAYLIST_KEY) || "[]"
        );
        setIsSaved(stored.some(item => item.id === v.id));
      }
      // increment view only for backend-backed videos
      if (!v.id.toString().startsWith("demo-")) {
        try {
          await apiFetch("/videos/increment-view", {
            method: "POST",
            body: JSON.stringify({ video_id: v.id })
          });
        } catch {
          // ignore
        }
      }
    };
    void load();
  }, [videoId]);

  const togglePlaylist = () => {
    if (!video || typeof window === "undefined") return;
    const stored: Video[] = JSON.parse(window.localStorage.getItem(PLAYLIST_KEY) || "[]");
    if (stored.some(v => v.id === video.id)) {
      const next = stored.filter(v => v.id !== video.id);
      window.localStorage.setItem(PLAYLIST_KEY, JSON.stringify(next));
      setIsSaved(false);
    } else {
      const next = [...stored, video];
      window.localStorage.setItem(PLAYLIST_KEY, JSON.stringify(next));
      setIsSaved(true);
    }
  };

  const markComplete = async () => {
    if (!token || !userId || !video) return;
    if (video.id.toString().startsWith("demo-")) return; // skip backend for demo videos
    try {
      await apiFetch("/progress/update", {
        method: "POST",
        token,
        body: JSON.stringify({
          user_id: userId,
          course_id: null,
          video_id: video.id,
          completed: true
        })
      });
    } catch {
      // ignore for now
    }
  };

  const generateSummary = async () => {
    if (!video) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiFetch<SummaryResponse>("/ai/generate-summary", {
        method: "POST",
        body: JSON.stringify({
          title: video.title,
          tags: video.tags,
          transcript: null
        })
      });
      setSummary(res);
    } catch (e: any) {
      setAiError(e.message || "Failed to generate summary");
    } finally {
      setAiLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!video) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiFetch<{ questions: QuizQuestion[] }>("/ai/generate-quiz", {
        method: "POST",
        body: JSON.stringify({
          topic: video.title,
          tags: video.tags
        })
      });
      setQuiz(res.questions);
    } catch (e: any) {
      setAiError(e.message || "Failed to generate quiz");
    } finally {
      setAiLoading(false);
    }
  };

  if (!video) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-6">
      <div className="space-y-3">
        <div className="h-[60vh] rounded-lg overflow-hidden bg-black">
          <VideoPlayer src={video.video_url} autoPlay loop />
        </div>
        <h1 className="text-xl font-semibold">{video.title}</h1>
        {video.description && (
          <p className="text-sm text-slate-300">{video.description}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {video.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-200"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button variant="secondary" onClick={markComplete}>
            Mark as complete
          </Button>
          <Button variant="secondary" onClick={togglePlaylist}>
            {isSaved ? "Remove from playlist" : "Save to playlist"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateSummary} disabled={aiLoading}>
            Summary
          </Button>
          <Button onClick={generateQuiz} disabled={aiLoading}>
            Quiz
          </Button>
        </div>
        {aiError && <p className="text-sm text-red-400">{aiError}</p>}
        {summary && (
          <div className="rounded-lg border border-slate-800 bg-card p-3 space-y-2">
            <h2 className="text-sm font-semibold">AI Summary</h2>
            <p className="text-sm text-slate-200">{summary.summary}</p>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {summary.key_points.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {quiz && (
          <div className="rounded-lg border border-slate-800 bg-card p-3 space-y-3">
            <h2 className="text-sm font-semibold">Quick Quiz</h2>
            {quiz.map((q, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <p className="font-medium">
                  {idx + 1}. {q.question}
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
                <p className="text-emerald-300 mt-0.5">Answer: {q.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



