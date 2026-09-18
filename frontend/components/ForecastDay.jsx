import React from 'react';
import { getWeatherAppearance } from '../weatherAppearance.js';

const formatDate = (value, options) => new Intl.DateTimeFormat('en', {
  ...options, timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`));

const temperature = (value) => value == null ? 'Unavailable' : `${Math.round(value)}°C`;

const ForecastDayCard = ({ day, appearance, selected, onSelect }) => (
  <li className={`forecast-day weather--${appearance.theme}`}>
    <h3><button type="button" className="forecast-select" aria-pressed={selected} aria-label={`Show hourly forecast for ${day.date}`} onClick={onSelect}>{formatDate(day.date, { weekday: 'short' })}</button></h3>
    <time dateTime={day.date}>{formatDate(day.date, { month: 'short', day: 'numeric' })}</time>
    <span className="forecast-icon" aria-hidden="true">{appearance.icon}</span>
    <p className="forecast-condition">{appearance.label}</p>
    <dl>
      <div><dt>High</dt><dd>{temperature(day.temperature_max)}</dd></div>
      <div><dt>Low</dt><dd>{temperature(day.temperature_min)}</dd></div>
      <div><dt>Precip.</dt><dd>{day.precipitation_probability == null ? 'Unavailable' : `${day.precipitation_probability}%`}</dd></div>
    </dl>
  </li>
);

const ForecastDay = ({ day, selected, onSelect }) => (
  <ForecastDayCard day={day} selected={selected} onSelect={onSelect} appearance={getWeatherAppearance(day.weather_code)} />
);

export default ForecastDay;
