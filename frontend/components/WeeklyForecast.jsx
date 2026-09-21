import React from 'react';
import ForecastDay from './ForecastDay.jsx';

const WeeklyForecast = ({ days, selectedDate, onSelectDate }) => (
  <section className="panel mt-5" aria-labelledby="forecast-heading">
    <h2 id="forecast-heading">7-day forecast</h2>
    <p className="muted">Select a day to explore its hours · Local time</p>
    <ul className="weekly-days">
      {days.map((day) => <ForecastDay key={day.date} day={day} selected={day.date === selectedDate} onSelect={() => onSelectDate(day.date)} />)}
    </ul>
  </section>
);

export default WeeklyForecast;
