import React from 'react';

const WeatherSkeleton = ({ search = false }) => (
  <section className={search ? 'loading-placeholder' : 'weather-layout loading-placeholder'} aria-label={search ? 'Loading locations' : 'Loading weather'} aria-busy="true">
    <span className="sr-only">{search ? 'Searching for locations…' : 'Loading your forecast…'}</span>
    {search ? <div className="skeleton-line" aria-hidden="true" /> : <>
      <div className="skeleton-card" aria-hidden="true"><div className="skeleton-line" /><div className="skeleton-temperature" /><div className="skeleton-line" /><div className="skeleton-chart" /></div>
      <div className="skeleton-card" aria-hidden="true"><div className="skeleton-week">{Array.from({ length: 7 }, (_, index) => <div key={index} className="skeleton-day" />)}</div><div className="skeleton-chart" /><div className="skeleton-chart" /></div>
    </>}
  </section>
);

export default WeatherSkeleton;
