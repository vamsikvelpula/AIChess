from functools import wraps

from flask import g, jsonify, request

from ..extensions import db
from ..models import Session, User


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        session = db.session.query(Session).filter_by(token=token).first()
        if session is None:
            return jsonify({"error": "Invalid or expired session"}), 401

        user = db.session.get(User, session.user_id)
        if user is None:
            return jsonify({"error": "Invalid or expired session"}), 401

        g.current_user = user
        return view(*args, **kwargs)

    return wrapped
