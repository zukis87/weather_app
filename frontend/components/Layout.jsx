import React from 'react';

export const AppHeader = () => (
  <header>
    <div className="brand">
      <span aria-hidden="true">◒</span> CITY WEATHER
    </div>
    <h1>A little look outside.</h1>
    <p className="intro">
      Find the temperature and humidity, wherever your day takes you.
    </p>
  </header>
);

export const EmptyState = () => (
  <section className="empty">
    <span aria-hidden="true">◌</span>
    <p>Your next forecast starts with a city.</p>
  </section>
);

export const AppFooter = () => (
  <footer>
    Weather by <a href="https://open-meteo.com/">Open-Meteo</a>
    {' · Location data by '}
    <a href="https://www.geonames.org/">GeoNames</a>
  </footer>
);
