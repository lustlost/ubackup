# coding:utf-8
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask_login import current_user
import json
import time
import redis
from flask_restless import APIManager, ProcessingException

app = Flask(__name__, static_url_path='', static_folder='static')

app.config.from_object('config')

db = SQLAlchemy(app)

from functools import wraps
from flask import make_response


def allow_cross_domain(fun):
    @wraps(fun)
    def wrapper_fun(*args, **kwargs):
        rst = make_response(fun(*args, **kwargs))
        rst.headers['Access-Control-Allow-Origin'] = '*'
        rst.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
        allow_headers = "Referer,Accept,Origin,User-Agent"
        rst.headers['Access-Control-Allow-Headers'] = allow_headers
        return rst

    return wrapper_fun



manager = APIManager(app, flask_sqlalchemy_db=db)

from myapp.views import front, alert, login
from myapp.models import Cluster, Node, BackupType, Business, BackupInstance, User

crud = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']

manager.create_api(Node, methods=crud, results_per_page=None,
                   max_results_per_page=999999999999999)
manager.create_api(Cluster, methods=crud, results_per_page=None,
                   max_results_per_page=999999999999999)

manager.create_api(BackupType, methods=crud, include_columns=['id', 'name'], results_per_page=None,
                   max_results_per_page=999999999999999)

manager.create_api(Business, methods=crud, include_columns=['id', 'business_id', 'name'], results_per_page=None,
                   max_results_per_page=999999999999999)

manager.create_api(BackupInstance, methods=crud, max_results_per_page=999999999999999,allow_delete_many=True)

