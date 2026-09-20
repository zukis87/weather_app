"""Open-Meteo requests and weather data parsing, independent of the UI."""

import json
import math
import ssl
from collections import OrderedDict
from copy import deepcopy
from threading import RLock
from time import monotonic
from email.utils import parsedate_to_datetime
from datetime import timezone
from datetime import date, datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

import certifi


class WeatherError(Exception):
    """An error that can be displayed to the user."""


_cache = OrderedDict()
_cooldowns = {}
_request_lock = RLock()
_RATE_LIMIT_MESSAGE = "Open-Meteo is temporarily rate-limiting this server. Please try again later."


def _get_json(url, parameters):
    key = (url, urlencode(sorted(parameters.items())))
    with _request_lock:
        now = monotonic()
        cached = _cache.get(key)
        if cached and cached[0] > now:
            _cache.move_to_end(key)
            return deepcopy(cached[1])
        if _cooldowns.get(url, 0) > now:
            raise WeatherError(_RATE_LIMIT_MESSAGE)
        try:
            data = _request_json(url, parameters)
        except WeatherError as error:
            cause = error.__cause__
            if isinstance(cause, HTTPError) and cause.code == 429:
                delay = 60
                retry = cause.headers.get('Retry-After') if cause.headers else None
                try:
                    delay = max(1, int(retry))
                except (TypeError, ValueError):
                    try:
                        delay = max(1, (parsedate_to_datetime(retry) - datetime.now(timezone.utc)).total_seconds())
                    except (TypeError, ValueError, AttributeError):
                        pass
                _cooldowns[url] = monotonic() + delay
            raise
        _cache[key] = (monotonic() + 300, deepcopy(data))
        _cache.move_to_end(key)
        while len(_cache) > 128:
            _cache.popitem(last=False)
        return data


def _request_json(url, parameters):
    context = ssl.create_default_context(cafile=certifi.where())
    try:
        with urlopen(f"{url}?{urlencode(parameters)}", context=context, timeout=10) as response:
            data = json.load(response)
    except HTTPError as error:
        if error.code == 429:
            raise WeatherError(_RATE_LIMIT_MESSAGE) from error
        raise WeatherError(f"The weather service returned HTTP {error.code}.") from error
    except (URLError, TimeoutError, OSError) as error:
        raise WeatherError("Could not reach the weather service. Check your connection and try again.") from error
    except (ValueError, UnicodeError) as error:
        raise WeatherError("The weather service returned invalid data.") from error
    if not isinstance(data, dict) or data.get("error"):
        raise WeatherError("The weather service could not process the request.")
    return data


def search_cities(name):
    """Return matching cities with coordinates and region information."""
    if len(name.strip()) < 2:
        raise WeatherError("Enter at least two characters for the city name.")
    data = _get_json("https://geocoding-api.open-meteo.com/v1/search", {
        "name": name.strip(), "count": 10, "language": "en", "format": "json",
    })
    cities = data.get("results", [])
    if not isinstance(cities, list) or any(
        not isinstance(city, dict)
        or not {"name", "latitude", "longitude"}.issubset(city)
        for city in cities
    ):
        raise WeatherError("The service returned invalid city information.")
    return cities


def parse_forecast(daily):
    """Pair daily readings by date, preserving unavailable values as None."""
    try:
        fields = [daily[key] for key in (
            "time", "temperature_2m_min", "temperature_2m_max",
            "precipitation_probability_max", "weather_code",
        )]
        if any(not isinstance(values, list) or len(values) != 7 for values in fields):
            raise ValueError("Expected seven days")
        forecast = []
        for day, minimum, maximum, precipitation, weather_code in zip(*fields):
            date.fromisoformat(day)
            for value in (minimum, maximum, precipitation):
                if value is not None and (type(value) not in (int, float) or not math.isfinite(value)):
                    raise ValueError("Invalid daily reading")
            if precipitation is not None and not 0 <= precipitation <= 100:
                raise ValueError("Invalid probability")
            if weather_code is not None and type(weather_code) is not int:
                raise ValueError("Invalid weather code")
            forecast.append({
                "date": day, "temperature_min": minimum,
                "temperature_max": maximum, "precipitation_probability": precipitation,
                "weather_code": weather_code,
            })
        return forecast
    except (KeyError, TypeError, ValueError) as error:
        raise WeatherError("The weekly forecast is unavailable for this location.") from error


def optional_number(value):
    """Keep missing or invalid optional readings out of the UI."""
    return value if type(value) in (int, float) and math.isfinite(value) else None


def parse_hourly(hourly, local_date=None):
    """Parse all forecast hours, optionally filtering by the city's local date."""
    try:
        times = hourly["time"]
        temperatures = hourly["temperature_2m"]
        probabilities = hourly["precipitation_probability"]
        if not all(isinstance(values, list) for values in (times, temperatures, probabilities)):
            raise ValueError("Invalid hourly arrays")
        if not len(times) == len(temperatures) == len(probabilities):
            raise ValueError("Mismatched hourly arrays")
        result = []
        for time, temperature, probability in zip(times, temperatures, probabilities):
            timestamp = datetime.fromisoformat(time)
            if local_date is None or timestamp.date().isoformat() == local_date:
                probability = optional_number(probability)
                result.append({
                    "time": time,
                    "temperature": optional_number(temperature),
                    "precipitation_probability": probability if probability is not None and 0 <= probability <= 100 else None,
                })
        return result
    except (KeyError, TypeError, ValueError):
        return []


def sun_time(daily, key, local_date):
    try:
        index = daily["time"].index(local_date)
        value = daily[key][index]
        return datetime.fromisoformat(value).strftime("%H:%M") if value else None
    except (KeyError, IndexError, TypeError, ValueError, AttributeError):
        return None


def get_weather(latitude, longitude):
    """Return current conditions and a seven-day forecast in the city's timezone."""
    data = _get_json("https://api.open-meteo.com/v1/forecast", {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,weather_code,is_day,apparent_temperature,wind_speed_10m",
        "daily": "temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code,sunrise,sunset",
        "hourly": "temperature_2m,precipitation_probability",
        "wind_speed_unit": "kmh",
        "forecast_days": 7,
        "temperature_unit": "celsius",
        "timezone": "auto",
    })
    try:
        current = data["current"]
        temperature = current["temperature_2m"]
        humidity = current["relative_humidity_2m"]
        time = current["time"].replace("T", " ")
        if not isinstance(temperature, (int, float)) or not isinstance(humidity, (int, float)):
            raise ValueError("Missing weather readings")
    except (KeyError, TypeError, AttributeError, ValueError) as error:
        raise WeatherError("Temperature or humidity is unavailable for this location.") from error
    return {
        "temperature": temperature, "humidity": humidity, "time": time,
        "weather_code": current.get("weather_code"),
        "is_day": current.get("is_day"),
        "forecast": parse_forecast(data.get("daily")),
        "apparent_temperature": optional_number(current.get("apparent_temperature")),
        "wind_speed": optional_number(current.get("wind_speed_10m")),
        "sunrise": sun_time(data.get("daily"), "sunrise", time[:10]),
        "sunset": sun_time(data.get("daily"), "sunset", time[:10]),
        "hourly": parse_hourly(data.get("hourly")),
    }
