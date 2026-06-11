"""Create all database tables. Run with:

    python scripts/init_db.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from app.extensions import db


def main():
    app = create_app()
    with app.app_context():
        db.create_all()
    print("Database initialized.")


if __name__ == "__main__":
    main()
