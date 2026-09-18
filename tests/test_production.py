import unittest
from unittest.mock import patch

from production import app


class ProductionTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health(self):
        self.assertEqual(self.client.get('/healthz').json, {'status': 'ok'})

    def test_api_uses_shared_validation(self):
        self.assertEqual(self.client.get('/api/weather?latitude=nan&longitude=0').status_code, 400)
        self.assertEqual(self.client.get('/api/unknown').status_code, 404)

    def test_weather(self):
        with patch('weather_server.get_weather', return_value={'temperature': 25}):
            response = self.client.get('/api/weather?latitude=32&longitude=34')
        self.assertEqual(response.json, {'temperature': 25})
        self.assertEqual(response.headers['Cache-Control'], 'no-store')

    def test_frontend_and_private_files(self):
        for asset in ('/', '/favicon.svg'):
            with self.client.get(asset) as response:
                self.assertEqual(response.status_code, 200)
        for path in ('/production.py', '/.env', '/../weather_service.py', '/missing.js'):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)
