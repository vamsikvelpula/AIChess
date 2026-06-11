from flask import Blueprint, g, jsonify

from ..auth.decorators import login_required

bp = Blueprint("progress", __name__, url_prefix="/api/progress")


@bp.get("")
@login_required
def get_progress():
    return jsonify(g.current_user.progress.to_dict()), 200
