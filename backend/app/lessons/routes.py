from flask import Blueprint, jsonify, request

from ..auth.decorators import login_required
from .loader import get_lesson, list_lessons

bp = Blueprint("lessons", __name__, url_prefix="/api/lessons")


@bp.get("")
@login_required
def list_all():
    category = request.args.get("category")
    return jsonify({"lessons": list_lessons(category)}), 200


@bp.get("/<slug>")
@login_required
def get_one(slug):
    lesson = get_lesson(slug)
    if lesson is None:
        return jsonify({"error": "lesson not found"}), 404
    return jsonify(lesson), 200
