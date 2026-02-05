"""Simple script to initialize the database tables."""
from backend import create_app, db

app = create_app()

with app.app_context():
    db.create_all()
    print('Database initialized at', app.config['SQLALCHEMY_DATABASE_URI'])
