import os
from datetime import datetime
from zoneinfo import ZoneInfo

ICON_CODES = {
    'clear-day': 0, 'clear-night': 0, 'partly-cloudy-day': 2,
    'partly-cloudy-night': 2, 'cloudy': 3, 'fog': 45,
    'rain': 61, 'showers-day': 80, 'showers-night': 80,
    'snow': 71, 'snow-showers-day': 85, 'snow-showers-night': 85,
    'thunder-rain': 95, 'thunder-showers-day': 95, 'thunder-showers-night': 95,
};


def fetch_forecast(latitude, longitude, request_json):
    key = os.environ.get('VISUAL_CROSSING_API_KEY', '').strip()
    if not key:
        raise ValueError('Weather is not configured. Set VISUAL_CROSSING_API_KEY on the server.')
    data = request_json(
        f'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{latitude},{longitude}',
        {'key': key, 'unitGroup': 'metric', 'include': 'current,days,hours', 'contentType': 'json', 'iconSet': 'icons2'},
    )
    current = data['currentConditions']
    local_time = datetime.fromtimestamp(current['datetimeEpoch'], ZoneInfo(data['timezone']))
    days = data['days'][:7]
    daily = {key: [] for key in ('time', 'temperature_2m_min', 'temperature_2m_max', 'precipitation_probability_max', 'weather_code', 'sunrise', 'sunset')}
    hourly = {'time': [], 'temperature_2m': [], 'precipitation_probability': []}
    for day in days:
        day_date = day['datetime']
        daily['time'].append(day_date)
        daily['temperature_2m_min'].append(day.get('tempmin'))
        daily['temperature_2m_max'].append(day.get('tempmax'))
        daily['precipitation_probability_max'].append(day.get('precipprob'))
        daily['weather_code'].append(ICON_CODES.get(day.get('icon')))
        for event in ('sunrise', 'sunset'):
            daily[event].append(f"{day_date}T{day[event]}" if day.get(event) else None)
        for hour in day.get('hours', []):
            hourly['time'].append(f"{day_date}T{hour['datetime']}")
            hourly['temperature_2m'].append(hour.get('temp'))
            hourly['precipitation_probability'].append(hour.get('precipprob'))
    return {
        'current': {
            'temperature_2m': current.get('temp'), 'relative_humidity_2m': current.get('humidity'),
            'time': local_time.strftime('%Y-%m-%dT%H:%M'),
            'apparent_temperature': current.get('feelslike'), 'wind_speed_10m': current.get('windspeed'),
            'weather_code': ICON_CODES.get(current.get('icon')),
            'is_day': 0 if current.get('icon', '').endswith('night') else 1,
        },
        'daily': daily, 'hourly': hourly,
    }
