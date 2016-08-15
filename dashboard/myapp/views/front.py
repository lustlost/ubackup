from myapp import app, db
from myapp.models import User
from flask import render_template, request
from flask_login import login_required, current_user
import json


@app.route('/html/<html_file_name>')
@login_required
def render_html(html_file_name):
    return render_template(html_file_name + '.html')


@app.route('/')
@app.route('/index')
@login_required
def index():
    user = current_user
    return render_template('base.html', **locals())


@login_required
@app.route('/api/get_force_business', methods=['GET'])
def get_force_business():
    user = current_user
    u = User.query.filter_by(id=user.id).first()
    if u.focus_business:
        return u.focus_business
    else:
        return json.dumps([])


@login_required
@app.route('/api/set_force_business', methods=['POST'])
def set_force_business():
    try:

        user = current_user
        force_business = json.dumps(request.get_json()['force_business'])
        u = User.query.filter_by(id=user.id).first()
        u.focus_business = force_business
        u.save()
        return json.dumps({"state": True, "data": ""})
    except Exception, e:
        return json.dumps({"state": False, "data": e})


@login_required
@app.route('/api/get_backup_list', methods=['GET'])
def get_backup_list():
    q_string = {
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {"server_id": request.args.get('server_id')}
                    },
                    {
                        "term": {"type": request.args.get('type')}
                    },
                    {
                        "term": {"instance": int(request.args.get('instance'))}
                    }
                ]
            }
        },
        "sort": [
            {"create_time": {"order": "desc"}},
        ],
        "size": 480,
    }

    import requests

    b = requests.get("http://127.0.0.1:9200/uuzubackup/table/_search", data=json.dumps(q_string))
    return json.dumps([i['_source'] for i in b.json()['hits']['hits']])
