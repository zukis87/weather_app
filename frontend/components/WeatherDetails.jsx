import React from 'react';

const reading = (value, unit) => Number.isFinite(value) ? `${value.toFixed(1)} ${unit}` : 'Unavailable';

const WeatherDetails = ({ weather }) => (
  <dl className="weather-details">
    <div><dt>Feels like</dt><dd>{reading(weather.apparent_temperature, '°C')}</dd></div>
    <div><dt>Wind speed</dt><dd>{reading(weather.wind_speed, 'km/h')}</dd></div>
    <div><dt>Sunrise · Local time</dt><dd>{weather.sunrise ?? 'Unavailable'}</dd></div>
    <div><dt>Sunset · Local time</dt><dd>{weather.sunset ?? 'Unavailable'}</dd></div>
  </dl>
);

export default WeatherDetails;
