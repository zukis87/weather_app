import React from 'react';
import WeatherDetails from './WeatherDetails.jsx';
import { cityLabel } from '../cityLabel.js';
import { getWeatherAppearance } from '../weatherAppearance.js';

const WeatherMetric = ({ label, value, unit }) => (
  <div className="metric">
    <p>{label}</p>
    <strong>{value}<span>{unit}</span></strong>
  </div>
);

const WeatherCard = ({ city, weather, appearance }) => (
  <section className={`weather weather--${appearance.theme}`} aria-label="Current weather">
    <div className="weather-heading">
      <div>
        <p className="eyebrow">CURRENT CONDITIONS</p>
        <h2>{city.name}</h2>
        <p className="muted">{cityLabel(city)}</p>
        <p className="weather-condition">{appearance.label}</p>
      </div>
      <span className="weather-icon" aria-hidden="true">{appearance.icon}</span>
    </div>
    <div className="metrics">
      <WeatherMetric
        label="Temperature"
        value={`${weather.temperature.toFixed(1)} `}
        unit="°C"
      />
      <WeatherMetric
        label="Relative humidity"
        value={String(weather.humidity)}
        unit=" %"
      />
    </div>
    <WeatherDetails weather={weather} />
    <p className="updated">Updated {weather.time} · Local time</p>
  </section>
);

const WeatherResult = ({ city, weather }) => (
  <WeatherCard
    city={city}
    weather={weather}
    appearance={getWeatherAppearance(weather.weather_code, weather.is_day)}
  />
);

export default WeatherResult;
