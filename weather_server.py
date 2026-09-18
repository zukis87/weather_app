"""Local HTTP routes connecting the React UI to the weather service."""

import errno
import json
import math
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from weather_service import WeatherError, get_weather, search_cities

class WeatherHandler(BaseHTTPRequestHandler):
    def send_content(self, status, content, content_type):
        self.send_response(status)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)

    def send_json(self, status, data):
        self.send_content(status, json.dumps(data).encode("utf-8"), "application/json")

    def do_GET(self):
        status, data = handle_request(self.path)
        self.send_json(status, data)


def handle_request(path):
    url = urlsplit(path)
    query = parse_qs(url.query)
    try:
        if url.path == "/api/cities":
            name = query.get("name", [""])[0].strip()
            if len(name) < 2:
                raise ValueError("Enter at least two characters for the city name.")
            return 200, search_cities(name)
        elif url.path == "/api/weather":
            try:
                latitude = float(query.get("latitude", [""])[0])
                longitude = float(query.get("longitude", [""])[0])
            except ValueError:
                raise ValueError("Valid latitude and longitude are required.") from None
            if not (math.isfinite(latitude) and math.isfinite(longitude)
                    and -90 <= latitude <= 90 and -180 <= longitude <= 180):
                raise ValueError("Coordinates are outside the valid range.")
            return 200, get_weather(latitude, longitude)
        else:
            return 404, {"error": "Page not found."}
    except ValueError as error:
        return 400, {"error": str(error)}
    except WeatherError as error:
        return 502, {"error": str(error)}


def run_server(port=8000):
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), WeatherHandler)
    except OSError as error:
        if error.errno != errno.EADDRINUSE:
            raise
        print(f"Port {port} is already in use. Stop the previous Python server and try again.", flush=True)
        raise SystemExit(1) from None

    with server:
        actual_port = server.server_address[1]
        print(f"Weather API is running at http://127.0.0.1:{actual_port}", flush=True)
        print("Start the React UI separately: cd frontend && npm run dev", flush=True)
        print("Press Ctrl+C to stop.", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
