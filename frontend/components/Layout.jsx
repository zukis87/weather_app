import React from 'react';

export const AppHeader = () => (
  <header>
    <div className="brand flex items-center gap-2.5 text-xs font-bold tracking-[2px]">
      <span aria-hidden="true">◒</span> CITY WEATHER
    </div>
    <h1>A little look outside.</h1>
    <p className="mb-[30px] max-w-[480px] text-[17px] leading-[1.6] text-[#61706a]">
      Find the temperature and humidity, wherever your day takes you.
    </p>
  </header>
);

export const EmptyState = () => (
  <section className="empty px-3 py-[30px] text-center text-sm text-[#788675]">
    <span className="text-[40px]" aria-hidden="true">◌</span>
    <p>Your next forecast starts with a city.</p>
  </section>
);

export const AppFooter = () => (
  <footer>
    Weather by <a href="https://www.visualcrossing.com/">Visual Crossing</a>
    {' · City search by '}
    <a href="https://open-meteo.com/">Open-Meteo</a>
    {' / '}
    <a href="https://www.geonames.org/">GeoNames</a>
  </footer>
);
