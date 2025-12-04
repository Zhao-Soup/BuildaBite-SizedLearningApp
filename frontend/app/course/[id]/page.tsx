"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/auth-context";
import { Button } from "../../../components/ui/button";
import { apiFetch } from "../../../lib/api";

type Course = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  video_ids: string[];
  learners_enrolled: number;
};

type Video = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  video_url: string;
};

export default function CoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const { token, userId } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const c = await apiFetch<Course>(`/courses/${courseId}`);
        setCourse(c);
        const videoDetails: Video[] = [];
        for (const id of c.video_ids) {
          try {
            const v = await apiFetch<Video>(`/videos/${id}`);
            videoDetails.push(v);
          } catch {
            // ignore
          }
        }
        setVideos(videoDetails);
        if (token && userId) {
          try {
            const p = await apiFetch<{ completed: number; total: number }>(
              `/progress/user/${userId}/course/${courseId}`,
              { token }
            );
            setProgress(p);
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [courseId, token, userId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-slate-300">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">{course.title}</h1>
        {course.description && (
          <p className="text-sm text-slate-300 mb-2">{course.description}</p>
        )}
        <p className="text-xs text-slate-400">
          {course.learners_enrolled} learners enrolled · {course.video_ids.length} videos
        </p>
        {progress && (
          <p className="text-xs text-emerald-300 mt-1">
            Progress: {progress.completed}/{progress.total || course.video_ids.length} completed
          </p>
        )}
      </div>
      <div className="space-y-3">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-card px-4 py-3"
          >
            <div>
              <p className="text-xs text-slate-400">Lesson {index + 1}</p>
              <h2 className="text-sm font-medium mb-1">{video.title}</h2>
              {video.description && (
                <p className="text-xs text-slate-300 line-clamp-2">{video.description}</p>
              )}
            </div>
            <Link href={`/learn/${video.id}`}>
              <Button variant="secondary" className="text-xs px-3 py-1">
                Start
              </Button>
            </Link>
          </div>
        ))}
        {!videos.length && (
          <p className="text-xs text-slate-400">No videos defined for this course yet.</p>
        )}
      </div>
    </div>
  );
}



