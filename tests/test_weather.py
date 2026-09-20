"""Offline service and HTTP contract tests. Run with unittest discovery."""
import io
import json
import unittest
from copy import deepcopy
from unittest.mock import patch
from urllib.error import URLError
from urllib.parse import parse_qs, urlsplit

from weather_service import WeatherError, _get_json, get_weather, parse_hourly, search_cities
from weather_server import WeatherHandler


def forecast_response():
    return {
        'current': {'temperature_2m': 0, 'relative_humidity_2m': 0,
                    'time': '2026-09-17T12:00', 'weather_code': 61, 'is_day': 1,
                    'apparent_temperature': -2, 'wind_speed_10m': 0},
        'daily': {'time': [f'2026-09-{day}' for day in range(17, 24)],
                  'temperature_2m_min': [-2] * 7, 'temperature_2m_max': [10] * 7,
                  'precipitation_probability_max': [0] * 7, 'weather_code': [61] * 7,
                  'sunrise': ['2026-09-17T06:20'] * 7, 'sunset': [None] * 7},
        'hourly': {'time': ['2026-09-17T00:00', '2026-09-18T00:00'],
                   'temperature_2m': [0, 10], 'precipitation_probability': [0, 100]},
    }


class ServiceTests(unittest.TestCase):
    def setUp(self):
        from weather_service import _cache, _cooldowns
        _cache.clear()
        _cooldowns.clear()

    def test_weather_contract_and_request_units(self):
        with patch('weather_service._get_json', return_value=forecast_response()) as request:
            result = get_weather(32, 34)
        self.assertEqual(result['temperature'], 0)
        self.assertEqual(result['wind_speed'], 0)
        self.assertEqual(result['apparent_temperature'], -2)
        self.assertEqual(result['sunrise'], '06:20')
        self.assertIsNone(result['sunset'])
        self.assertEqual(len(result['forecast']), 7)
        self.assertEqual(result['forecast'][0]['weather_code'], 61)
        self.assertEqual(len(result['hourly']), 2)
        self.assertEqual(result['hourly'][1], {'time': '2026-09-18T00:00', 'temperature': 10, 'precipitation_probability': 100})
        parameters = request.call_args.args[1]
        self.assertEqual(parameters['timezone'], 'auto')
        self.assertEqual(parameters['wind_speed_unit'], 'kmh')
        self.assertIn('precipitation_probability', parameters['hourly'])

    def test_invalid_weekly_data_is_rejected(self):
        for value in ([0], [101] * 7, ['invalid'] * 7):
            with self.subTest(value=value):
                data = forecast_response()
                data['daily']['precipitation_probability_max'] = value
                with patch('weather_service._get_json', return_value=data):
                    with self.assertRaises(WeatherError):
                        get_weather(32, 34)

    def test_missing_current_readings_fail(self):
        data = forecast_response()
        del data['current']['temperature_2m']
        with patch('weather_service._get_json', return_value=data):
            with self.assertRaises(WeatherError):
                get_weather(32, 34)

    def test_optional_hourly_data_preserves_gaps(self):
        data = deepcopy(forecast_response()['hourly'])
        data['temperature_2m'][0] = None
        self.assertIsNone(parse_hourly(data, '2026-09-17')[0]['temperature'])
        data['time'].pop()
        self.assertEqual(parse_hourly(data, '2026-09-17'), [])
        self.assertEqual(parse_hourly(None, '2026-09-17'), [])

    def test_city_validation_and_empty_results(self):
        with patch('weather_service._get_json', return_value={}) as request:
            with self.assertRaises(WeatherError):
                search_cities(' a ')
            request.assert_not_called()
            self.assertEqual(search_cities(' London '), [])
            self.assertEqual(request.call_args.args[1]['name'], 'London')

    def test_transport_encodes_query_and_decodes_json(self):
        with patch('weather_service.urlopen', return_value=io.BytesIO(b'{"results": []}')) as request:
            self.assertEqual(_get_json('https://example.test', {'name': 'Tel Aviv & coast'}), {'results': []})
        self.assertEqual(parse_qs(urlsplit(request.call_args.args[0]).query)['name'], ['Tel Aviv & coast'])
        self.assertEqual(request.call_args.kwargs['timeout'], 10)

    def test_transport_errors_are_user_facing(self):
        for error in (URLError('offline'), TimeoutError()):
            with self.subTest(error=error), patch('weather_service.urlopen', side_effect=error):
                with self.assertRaises(WeatherError):
                    _get_json('https://example.test', {})
        for payload in (b'not json', b'[]', b'{"error": true}'):
            with self.subTest(payload=payload), patch('weather_service.urlopen', return_value=io.BytesIO(payload)):
                with self.assertRaises(WeatherError):
                    _get_json('https://example.test', {})


class MemoryConnection:
    """Exercise the real HTTP parser and serializer without binding a port."""
    def __init__(self, path):
        self.request = io.BytesIO(f'GET {path} HTTP/1.0\r\nHost: localhost\r\n\r\n'.encode())
        self.response = bytearray()

    def makefile(self, *args, **kwargs):
        return self.request

    def sendall(self, data):
        self.response.extend(data)


def get_route(path):
    connection = MemoryConnection(path)
    with patch.object(WeatherHandler, 'log_message'):
        WeatherHandler(connection, ('127.0.0.1', 12345), None)
    headers, body = bytes(connection.response).split(b'\r\n\r\n', 1)
    return int(headers.split()[1]), json.loads(body), headers


class RouteTests(unittest.TestCase):
    def test_invalid_coordinates_never_call_upstream(self):
        for query in ('', 'latitude=x&longitude=0', 'latitude=nan&longitude=0',
                      'latitude=0&longitude=inf', 'latitude=91&longitude=0', 'latitude=0&longitude=-181'):
            with self.subTest(query=query), patch('weather_server.get_weather') as service:
                self.assertEqual(get_route('/api/weather?' + query)[0], 400)
                service.assert_not_called()

    def test_weather_response_and_headers(self):
        with patch('weather_server.get_weather', return_value={'temperature': 0}) as service:
            status, body, headers = get_route('/api/weather?latitude=-90&longitude=180')
        self.assertEqual((status, body), (200, {'temperature': 0}))
        service.assert_called_once_with(-90, 180)
        self.assertIn(b'application/json', headers)
        self.assertIn(b'Cache-Control: no-store', headers)

    def test_service_failure_and_unknown_route(self):
        with patch('weather_server.search_cities', side_effect=WeatherError('Unavailable')):
            self.assertEqual(get_route('/api/cities?name=London')[:2], (502, {'error': 'Unavailable'}))
        self.assertEqual(get_route('/missing')[0], 404)
        self.assertEqual(get_route('/api/cities?name=a')[0], 400)
