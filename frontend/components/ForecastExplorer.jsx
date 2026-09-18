import React, { useState } from 'react';
import WeeklyForecast from './WeeklyForecast.jsx';
import HourlyForecast from './HourlyForecast.jsx';

const ForecastExplorer = ({ weather }) => {
  const [selectedDate, setSelectedDate] = useState(weather.forecast[0]?.date ?? weather.time.slice(0, 10));
  const hours = (weather.hourly ?? []).filter((hour) => hour.time.slice(0, 10) === selectedDate);

  return (
    <>
      <WeeklyForecast days={weather.forecast} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <HourlyForecast key={selectedDate} date={selectedDate} hours={hours} />
    </>
  );
};

export default ForecastExplorer;
