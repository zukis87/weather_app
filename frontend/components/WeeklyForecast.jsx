import React from 'react';
import ForecastDay from './ForecastDay.jsx';

const WeeklyForecast = ({ days, selectedDate, onSelectDate }) => (
  <section className="panel forecast" aria-labelledby="forecast-heading">
    <h2 id="forecast-heading">7-day forecast</h2>
    <p className="muted">Choose a day to explore its hourly forecast. Starting today · Dates in the city's local time. Precipitation includes rain and snow.</p>
    <ul className="forecast-grid">
      {days.map((day) => <ForecastDay key={day.date} day={day} selected={day.date === selectedDate} onSelect={() => onSelectDate(day.date)} />)}
    </ul>
  </section>
);

export default WeeklyForecast;
