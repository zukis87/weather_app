from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

from weather_server import handle_request

DIST = Path(__file__).parent / 'frontend' / 'dist'
app = Flask(__name__, static_folder=None)


@app.get('/healthz')
def health():
    return jsonify(status='ok')


@app.get('/api/<path:path>')
def api(path):
    status, data = handle_request(request.full_path)
    response = jsonify(data)
    response.status_code = status
    response.headers['Cache-Control'] = 'no-store'
    return response


@app.get('/')
def index():
    return send_from_directory(DIST, 'index.html', max_age=0)


@app.get('/<path:path>')
def assets(path):
    return send_from_directory(DIST, path)
