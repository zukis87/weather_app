import React from 'react';
import HourlyChart from './HourlyChart.jsx';

const value = (reading, unit) => Number.isFinite(reading) ? `${reading}${unit}` : 'Unavailable';

const HourlyForecast = ({ hours = [], date }) => (
  <section className="panel hourly" aria-labelledby="hourly-heading">
    <h2 id="hourly-heading">Hourly forecast</h2>
    <p className="muted">{date ?? hours[0]?.time.slice(0, 10)} · City local time. Precipitation includes rain and snow.</p>
    {hours.length ? (
      <>
        <HourlyChart hours={hours} field="temperature" label="Temperature" unit="°C" />
        <HourlyChart hours={hours} field="precipitation_probability" label="Precipitation probability" unit="%" fixedScale />
        <details>
          <summary>View hourly values</summary>
          <div className="hourly-table">
            <table>
              <caption>{date} forecast · City local time</caption>
              <thead><tr><th scope="col">Time</th><th scope="col">Temperature</th><th scope="col">Precipitation</th></tr></thead>
              <tbody>{hours.map((hour) => (
                <tr key={hour.time}><th scope="row">{hour.time.slice(11, 16)}</th><td>{value(hour.temperature, '°C')}</td><td>{value(hour.precipitation_probability, '%')}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </details>
      </>
    ) : <p>Hourly forecast is unavailable for this location.</p>}
  </section>
);

export default HourlyForecast;
