import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGIN"]}})

    from .auth.routes import bp as auth_bp
    from .game.routes import bp as game_bp
    from .lessons.routes import bp as lessons_bp
    from .progress.routes import bp as progress_bp
    from .puzzles.routes import bp as puzzles_bp

    for blueprint in (auth_bp, game_bp, lessons_bp, progress_bp, puzzles_bp):
        app.register_blueprint(blueprint)

    return app
