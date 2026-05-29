import os

os.environ["TRADEDECK_DATABASE_URI"] = "sqlite:///tradedeck_local.db"

from app import create_app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8000, debug=True)
