import secrets

from flask import Blueprint, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import Progress, Session, User
from .decorators import login_required

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    if db.session.query(User).filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    user = User(name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.flush()

    progress = Progress(user_id=user.id)
    db.session.add(progress)

    token = secrets.token_urlsafe(32)
    db.session.add(Session(token=token, user_id=user.id))
    db.session.commit()

    return jsonify({"token": token, "user": user.to_dict()}), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = db.session.query(User).filter_by(email=email).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = secrets.token_urlsafe(32)
    db.session.add(Session(token=token, user_id=user.id))
    db.session.commit()

    return jsonify({"token": token, "user": user.to_dict()}), 200


@bp.post("/logout")
@login_required
def logout():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1].strip()
    db.session.query(Session).filter_by(token=token).delete()
    db.session.commit()
    return jsonify({"message": "logged out"}), 200


@bp.get("/me")
@login_required
def me():
    user = g.current_user
    progress = user.progress
    return jsonify({"user": user.to_dict(), "progress": progress.to_dict()}), 200
