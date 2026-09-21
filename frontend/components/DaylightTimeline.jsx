import React from 'react';
import { daylight } from '../daylight.js';
import DaylightArc from './DaylightArc.jsx';

const duration = (value) => `${Math.floor(value / 60)}h ${value % 60}m`;

const Timeline = ({ weather, day }) => (
  <section className="daylight" aria-labelledby="daylight-heading">
    <div className="daylight-heading flex flex-wrap items-center justify-between gap-2.5">
      <h3 id="daylight-heading">Daylight timeline</h3>
      {day && <span className="rounded-[20px] bg-[#f4e6c9] px-2.5 py-[5px] text-[11px] font-semibold text-[#715321]">{day.phase}</span>}
    </div>
    {day ? (
      <>
        <DaylightArc progress={day.progress} isDaytime={day.phase === 'Daylight'} />
        <div className="daylight-times mx-auto flex max-w-[400px] justify-between">
          <div><span>Sunrise</span><strong>{weather.sunrise}</strong></div>
          <div><span>Sunset</span><strong>{weather.sunset}</strong></div>
        </div>
        <dl className="daylight-summary mt-5 mb-0 grid grid-cols-2 gap-3 [border-width:1px_0_0] border-solid border-[#eadcc4] pt-[18px]">
          <div><dt>Total daylight</dt><dd>{duration(day.duration)}</dd></div>
          <div><dt>Daylight remaining</dt><dd>{duration(day.remaining)}</dd></div>
        </dl>
      </>
    ) : <p className="text-center text-[13px] text-[#75664f]">Daylight timeline unavailable for this location.</p>}
  </section>
);

const DaylightTimeline = ({ weather }) => (
  <Timeline weather={weather} day={daylight(weather.sunrise, weather.sunset, weather.time)} />
);

export default DaylightTimeline;
