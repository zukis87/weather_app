import React from 'react';
import DaylightTimeline from './DaylightTimeline.jsx';
import WeatherDetails from './WeatherDetails.jsx';
import { cityLabel } from '../cityLabel.js';
import { getWeatherAppearance } from '../weatherAppearance.js';

const WeatherCard = ({ city, weather, appearance }) => (
  <section className={`weather weather-hero weather--${appearance.theme}`} aria-label="Current weather">
    <p className="hero-eyebrow">CURRENT CONDITIONS</p>
    <h2 className="hero-city">{city.name}</h2>
    {cityLabel(city) !== city.name && <p className="muted">{cityLabel(city)}</p>}
    <div className="hero-reading">
      <div><span className="sr-only">Temperature </span><strong>{weather.temperature.toFixed(1)}<span>°C</span></strong></div>
      <span className="hero-weather-icon text-[88px] leading-none max-[480px]:text-[64px]" aria-hidden="true">{appearance.icon}</span>
    </div>
    <p className="hero-condition">{appearance.label}</p>
    <WeatherDetails weather={weather} />
    <DaylightTimeline weather={weather} />
    <p className="updated">Updated {weather.time} · Local time</p>
  </section>
);

const WeatherResult = ({ city, weather }) => (
  <WeatherCard city={city} weather={weather} appearance={getWeatherAppearance(weather.weather_code, weather.is_day)} />
);

export default WeatherResult;
