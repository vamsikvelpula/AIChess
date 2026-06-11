import json
import os

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "lessons.json")

_LESSONS_BY_SLUG: dict[str, dict] = {}
_LESSON_ORDER: list[str] = []


def _load():
    global _LESSONS_BY_SLUG, _LESSON_ORDER
    with open(_DATA_PATH) as f:
        data = json.load(f)
    _LESSONS_BY_SLUG = {lesson["slug"]: lesson for lesson in data["lessons"]}
    _LESSON_ORDER = [lesson["slug"] for lesson in data["lessons"]]


_load()


def summary_fields(lesson: dict) -> dict:
    return {
        "slug": lesson["slug"],
        "title": lesson["title"],
        "category": lesson["category"],
        "summary": lesson["summary"],
        "step_count": len(lesson["steps"]),
    }


def list_lessons(category: str | None = None) -> list[dict]:
    lessons = [_LESSONS_BY_SLUG[slug] for slug in _LESSON_ORDER]
    if category:
        lessons = [lesson for lesson in lessons if lesson["category"] == category]
    return [summary_fields(lesson) for lesson in lessons]


def get_lesson(slug: str) -> dict | None:
    return _LESSONS_BY_SLUG.get(slug)
