from __future__ import annotations

from typing import List

from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db import models

settings = get_settings()
client: OpenAI | None = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


def _fallback_summary(title: str, tags: List[str], transcript: str | None) -> dict:
    points = [f"Key idea: {tag}" for tag in tags[:3]] or ["Key idea: core concept"]
    return {
        "summary": f"{title} covers {', '.join(tags) or 'core ideas'} in under 90 seconds.",
        "key_points": points,
    }


def generate_summary(title: str, tags: List[str], transcript: str | None) -> dict:
    if client:
        prompt = (
            "Summarize the following short educational reel. Provide 2 sentences and bullet key points.\n"
            f"Title: {title}\nTags: {', '.join(tags)}\nTranscript: {transcript or 'Not provided'}"
        )
        try:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=[{"role": "user", "content": prompt}],
            )
            content = response.output[0].content[0].text if response.output else ""
            lines = [line.strip("- ") for line in content.splitlines() if line.strip()]
            summary = lines[0] if lines else "Concise summary pending."
            key_points = lines[1:4] or ["Review the video to learn key ideas."]
            return {"summary": summary, "key_points": key_points}
        except OpenAIError:
            pass
    return _fallback_summary(title, tags, transcript)


def _fallback_quiz(topic: str, tags: List[str]) -> List[dict]:
    base = tags[:2] or [topic]
    return [
        {
            "question": f"What is a core takeaway from {topic}?",
            "options": ["Definition", "Example", "Application", "Irrelevant"],
            "answer": "Application",
        }
        for _ in base
    ]


def generate_quiz(topic: str, tags: List[str]) -> List[dict]:
    if client:
        prompt = (
            "Create 3 concise MCQs with 4 options and answer key for the topic."
            f"Topic: {topic}. Tags: {', '.join(tags)}"
        )
        try:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=[{"role": "user", "content": prompt}],
            )
            content = response.output[0].content[0].text if response.output else ""
            questions: List[dict] = []
            for block in content.split("Question"):
                if not block.strip():
                    continue
                lines = [line.strip() for line in block.splitlines() if line.strip()]
                if not lines:
                    continue
                question = lines[0]
                options = [line.split(".", 1)[-1].strip() for line in lines[1:5]]
                answer = lines[5].split(":", 1)[-1].strip() if len(lines) > 5 else options[0]
                questions.append({"question": question, "options": options, "answer": answer})
            if questions:
                return questions
        except OpenAIError:
            pass
    return _fallback_quiz(topic, tags)


def recommend_videos(db: Session, recent_tags: List[str], limit: int = 15) -> List[models.Video]:
    videos = db.query(models.Video).all()
    scored: list[tuple[models.Video, float]] = []
    recent_set = set(tag.lower() for tag in recent_tags)
    for video in videos:
        tag_overlap = len(recent_set.intersection({tag.lower() for tag in (video.tags or [])}))
        trend_score = (video.views * 0.001) + (video.likes * 0.01)
        score = tag_overlap + trend_score
        scored.append((video, score))

    scored.sort(key=lambda pair: pair[1], reverse=True)
    top = [video for video, _ in scored[:limit]]

    if client and recent_tags:
        try:
            prompt = (
                \"Rank these video titles for a learner interested in the provided tags.\\n\"\n                f\"Tags: {', '.join(recent_tags)}\\n\"\n                + \"\\n\".join(f\"- {video.id} :: {video.title}\" for video in top)\n            )\n            response = client.responses.create(\n                model=\"gpt-4o-mini\",\n                input=[{\"role\": \"user\", \"content\": prompt}],\n            )\n            content = response.output[0].content[0].text if response.output else \"\"\n            ordered_ids: list[str] = []\n            for line in content.splitlines():\n                if \"::\" in line:\n                    vid_id = line.split(\"::\", 1)[0].strip(\"- \").strip()\n                    ordered_ids.append(vid_id)\n            id_map = {str(video.id): video for video in top}\n            re_ranked = [id_map[vid] for vid in ordered_ids if vid in id_map]\n            re_ranked.extend([video for video in top if str(video.id) not in ordered_ids])\n            return re_ranked[:limit]\n        except OpenAIError:\n            pass\n    return top
