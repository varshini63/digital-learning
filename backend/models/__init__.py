from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from Config import Config

# Declare db here
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Configure the app
    connection_string = f"oracle+cx_oracle://{Config.ORACLE_USER}:{Config.ORACLE_PASSWORD}@{Config.ORACLE_HOST}:{Config.ORACLE_PORT}/{Config.ORACLE_SERVICE_NAME}"
    app.config['SQLALCHEMY_DATABASE_URI'] = connection_string
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Enable CORS
    CORS(app, resources={r"/signup": {"origins": "http://localhost:3000"}})

    # Initialize db with the app
    db.init_app(app)

    return app
