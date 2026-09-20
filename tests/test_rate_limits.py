import unittest
from unittest.mock import patch
from urllib.error import HTTPError

from weather_service import _cache, _cooldowns, _get_json, WeatherError


class RateLimitTests(unittest.TestCase):
    def setUp(self):
        _cache.clear()
        _cooldowns.clear()

    def tearDown(self):
        _cache.clear()
        _cooldowns.clear()

    def test_success_is_cached_and_expires(self):
        with patch('weather_service.monotonic', return_value=0) as clock, patch('weather_service._request_json', return_value={'value': []}) as request:
            result = _get_json('https://example.test', {'latitude': 0})
            result['value'].append('changed')
            self.assertEqual(_get_json('https://example.test', {'latitude': 0}), {'value': []})
            request.assert_called_once()
            clock.return_value = 301
            _get_json('https://example.test', {'latitude': 0})
            self.assertEqual(request.call_count, 2)

    def test_429_respects_retry_after_without_retrying(self):
        error = HTTPError('https://example.test', 429, 'Too many requests', {'Retry-After': '120'}, None)
        with patch('weather_service.monotonic', return_value=0) as clock, patch('weather_service.urlopen', side_effect=error) as request:
            for parameters in ({'latitude': 0}, {'latitude': 1}):
                with self.assertRaisesRegex(WeatherError, 'rate-limiting'):
                    _get_json('https://example.test', parameters)
            request.assert_called_once()
            clock.return_value = 121
            with self.assertRaises(WeatherError):
                _get_json('https://example.test', {})
            self.assertEqual(request.call_count, 2)

    def test_cache_has_a_size_limit(self):
        with patch('weather_service._request_json', return_value={}):
            for index in range(140):
                _get_json('https://example.test', {'latitude': index})
        self.assertEqual(len(_cache), 128)
