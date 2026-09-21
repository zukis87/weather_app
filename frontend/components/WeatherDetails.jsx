import React from 'react';
import Icon from './Icon.jsx';

const reading = (value, unit) => Number.isFinite(value) ? `${value.toFixed(1)} ${unit}` : 'Unavailable';

const WeatherDetails = ({ weather }) => (
  <dl className="weather-details hero-details">
    <div><dt><Icon name="unknown" size={16} />Feels like</dt><dd>{reading(weather.apparent_temperature, '°C')}</dd></div>
    <div><dt><Icon name="wind" size={16} />Wind speed</dt><dd>{reading(weather.wind_speed, 'km/h')}</dd></div>
    <div><dt><Icon name="drop" size={16} />Relative humidity</dt><dd>{weather.humidity}%</dd></div>
  </dl>
);

export default WeatherDetails;
