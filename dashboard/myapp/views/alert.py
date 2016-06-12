from myapp import app
import json
import os

@app.route('/api/alert')
def alert():
    with open('myapp/cache/backup.error') as f:
        return json.dumps(json.load(f))
