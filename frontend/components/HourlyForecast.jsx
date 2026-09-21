import React from 'react';
import HourlyChart from './HourlyChart.jsx';

const HourlyForecast = ({ hours = [], date }) => (
  <section className="panel mt-5" aria-labelledby="hourly-heading">
    <h2 id="hourly-heading">Hourly forecast</h2>
    <p className="muted">{date ?? hours[0]?.time.slice(0, 10)} · City local time. Precipitation includes rain and snow.</p>
    {hours.length ? (
      <>
        <HourlyChart hours={hours} field="temperature" label="Temperature" unit="°C" />
        <HourlyChart hours={hours} field="precipitation_probability" label="Precipitation probability" unit="%" fixedScale />
      </>
    ) : <p>Hourly forecast is unavailable for this location.</p>}
  </section>
);

export default HourlyForecast;
