FROM node:24-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm test && npm run build

FROM python:3.13-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=10000
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r requirements-production.txt
COPY weather_service.py weather_server.py visual_crossing.py production.py ./
COPY tests/ ./tests/
COPY --from=frontend /build/frontend/dist ./frontend/dist
RUN python -m unittest discover -s tests -v
RUN useradd --create-home appuser
USER appuser
EXPOSE 10000
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 2 --threads 4 --timeout 60 production:app"]
