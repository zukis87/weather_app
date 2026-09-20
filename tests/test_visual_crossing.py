import unittest
from unittest.mock import patch
from visual_crossing import fetch_forecast
from weather_service import get_weather, WeatherError


class VisualCrossingTests(unittest.TestCase):
    def test_missing_key_does_not_request_upstream(self):
        with patch.dict('os.environ', {}, clear=True), patch('weather_service._get_json') as request:
            with self.assertRaisesRegex(WeatherError, 'VISUAL_CROSSING_API_KEY'):
                get_weather(0, 0)
            request.assert_not_called()

    def test_metric_forecast_and_local_time(self):
        payload = {'timezone': 'America/New_York', 'currentConditions': {
            'datetimeEpoch': 1789689600, 'temp': 0, 'humidity': 0, 'feelslike': -2,
            'windspeed': 0, 'icon': 'clear-night',
        }, 'days': [{'datetime': f'2026-09-{day}', 'tempmin': -2, 'tempmax': 10,
                    'precipprob': 0, 'icon': 'rain', 'sunrise': '06:20:00', 'sunset': None,
                    'hours': [{'datetime': '00:00:00', 'temp': None, 'precipprob': 0}]}
                   for day in range(17, 25)]}
        with patch.dict('os.environ', {'VISUAL_CROSSING_API_KEY': 'test-key'}), patch('weather_service._get_json', return_value=payload) as request:
            result = get_weather(0, -30)
        self.assertEqual(result['temperature'], 0)
        self.assertEqual(result['wind_speed'], 0)
        self.assertEqual(result['is_day'], 0)
        self.assertEqual(len(result['forecast']), 7)
        self.assertEqual(len(result['hourly']), 7)
        self.assertIsNone(result['hourly'][0]['temperature'])
        self.assertEqual(result['forecast'][0]['weather_code'], 61)
        self.assertEqual(request.call_args.args[1]['unitGroup'], 'metric')
        self.assertNotIn('test-key', str(result))

    def test_malformed_response_is_user_facing(self):
        with patch.dict('os.environ', {'VISUAL_CROSSING_API_KEY': 'test-key'}), patch('weather_service._get_json', return_value={}):
            with self.assertRaises(WeatherError):
                get_weather(0, 0)
