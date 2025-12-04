"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth-context";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CreatorUploadPage() {
  const { token, role } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please login as a creator to upload.");
      return;
    }
    if (role !== "creator") {
      setError("Only creators can upload videos.");
      return;
    }
    if (!file) {
      setError("Please select a video file.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("skill_level", skillLevel);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/videos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed");
      }

      const video = await res.json();
      router.push(`/learn/${video.id}`);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Upload an educational reel</h1>
      <p className="text-sm text-slate-300 mb-6">
        Short, focused videos (30–90 seconds). Add clear tags and descriptions so learners can
        discover your content.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Description</label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="What will learners take away from this reel?"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">
              Tags (comma separated, e.g. react, hooks, beginner)
            </label>
            <Input value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Skill level</label>
            <select
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Video file (MP4 / WebM)</label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}



