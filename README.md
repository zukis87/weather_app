# City Weather

React + Vite frontend with a Python API and Open-Meteo weather data.

## Setup

Install Node.js 24 LTS (includes npm), then install dependencies:

```bash
.venv/bin/python -m pip install -r requirements.txt
cd frontend
npm install
```

## Development

Start the Python API from the project root in one terminal:

```bash
.venv/bin/python api_requests.py
```

Start Vite in a second terminal:

```bash
cd frontend
npm run dev
```

Open http://127.0.0.1:5173. Vite compiles JSX and updates the browser when components change. Requests to `/api` are forwarded to Python on port 8000. Stop both processes with Ctrl+C. If port 8000 is busy, stop the previous Python instance first; the API no longer switches ports because Vite needs a stable target.

For a custom backend address, set `API_TARGET=http://127.0.0.1:YOUR_PORT` in `frontend/.env.local` and restart Vite.

## Build and preview

```bash
cd frontend
npm run build
npm run preview
```

The build is written to `frontend/dist`. Preview it at http://127.0.0.1:4173 with the Python API still running. For deployment, configure the host to forward `/api` to the backend; Vite's development proxy is not included in the static build.

## Files

- `frontend/main.jsx`: React entry point and styles.
- `frontend/app.jsx`: application state and coordination.
- `frontend/components/*.jsx`: reusable UI components.
- `frontend/api.js`: browser API requests.
- `frontend/vite.config.js`: React plugin and API proxy.
- `api_requests.py`: Python API launcher.
- `weather_server.py`: HTTP routes and input validation.
- `weather_service.py`: Open-Meteo requests and parsing.

React is installed locally through npm. Internet access is needed for weather data and the optional Google Font. The Python server is for local development.

## Tests

Run the offline Python suite from the project root (with the project's Python dependencies installed):

```sh
python -m unittest discover -s tests -v
```

Run the React and JavaScript tests:

```sh
cd frontend
npm ci
npm test
```

Use `npm run test:watch` during development. Run `npm run build` before shipping frontend changes.

Python uses the standard-library `unittest` runner. Tests cover weather parsing, missing data, request encoding, upstream failures, and real HTTP request/response handling through an in-memory connection, without opening a port. Frontend tests use Vitest, Testing Library, and jsdom to exercise city search, selection, loading/error/retry flows, chart interaction, and API requests. External services are mocked; neither suite requires running servers or live weather data. Fixtures use fixed dates and preserve zero values and missing readings.

Add regression tests for observable behavior, query UI elements by accessible role/name, and keep mocks at network/service boundaries. Avoid snapshots of entire components and assertions on CSS classes or internal React state. These tests do not replace a browser check for visual layout.

### Favorite locations

After choosing a matching city, select **Save city**. Favorites are stored in this browser's local storage and remain after reloading. Select a favorite to fetch fresh weather directly, or **Remove** to delete it. If browser storage is unavailable, favorites still work for the current visit and the app displays a message. Tests cover persistence, duplicate prevention, direct loading, removal, corrupt data, and storage failures.

### Globe location picker

Select the **Globe** tab, drag to rotate and scroll/pinch to zoom. Click a location to preview its coordinates, then choose **Show weather here**. The existing forecasts work with these coordinate locations, including oceans. Select a pin and choose Save location to add it to favorites without first loading weather. Loading failures leave the pin available for retry. City search remains available when WebGL 2 is unsupported.

The globe is lazy-loaded using react-globe.gl. The Earth texture is served locally from `frontend/public/earth-blue-marble.jpg`, sourced from the three-globe example assets: https://github.com/vasturiano/three-globe/tree/master/example/img . Globe tests mock the rendering boundary and check selection, confirmation, drag suppression, busy states and unsupported browsers. Check real rotation, zoom, pin placement and touch gestures in a WebGL-capable browser before release.

### Location tabs

Find a city, Favorites, and Globe provide three location pickers with icons. Favorites opens by default when valid saved locations exist; otherwise Find a city opens. The Globe tab displays the globe directly. Forecasts remain below the picker, and Save city appears only in city search; Save location appears beside the selected globe pin. Favorite locations lists saved cities and coordinates together. Arrow keys and Home/End navigate the tabs.

Saving a globe pin requires a nonblank location name (up to 80 characters). Favorites displays that name and retains the coordinates for weather requests. Existing saved locations are preserved.

## Production deployment (Render)

The Docker image builds and tests React, then serves the built frontend and API together with Flask/Gunicorn. The existing `api_requests.py` remains the local development entry point.

For local production checks:

```sh
.venv/bin/python -m pip install -r requirements-production.txt
cd frontend
npm ci
npm run build
cd ..
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/gunicorn --bind 127.0.0.1:8000 production:app
```

In Render, create a Blueprint from this repository and review `render.yaml`. It defines one Docker web service, the free plan, and a `/healthz` endpoint. Render supplies HTTPS and a public URL. Favorites remain local to each browser/origin and will not transfer automatically from localhost to the hosted URL.

Docker must be installed to build the image locally: `docker build -t city-weather .`, then `docker run --rm -p 10000:10000 city-weather`.
