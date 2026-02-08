from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

load_dotenv()

# Database instance
db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object('backend.config.Config')

    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    from backend.routes import bp as routes_bp
    app.register_blueprint(routes_bp, url_prefix='/api')

    # Enable CORS for the front-end static site
    from flask_cors import CORS
    CORS(app)

    # Ensure tables exist on startup
    from backend import models  # noqa: F401
    with app.app_context():
        db.create_all()

    return app
