import os

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TRADEDECK_DATABASE_URI",
        'postgresql://tradedeck:tradedeck123@172.17.26.141:5432/tradedeckdb'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "tradedeck-secreto-cambiar-en-produccion"
