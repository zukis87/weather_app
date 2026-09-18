import React, { useId, useState } from 'react';

const x = (index, count) => 52 + index * 596 / Math.max(count - 1, 1);
const y = (value, minimum, maximum) => 190 - (value - minimum) * 155 / (maximum - minimum);
const reading = (value, unit) => Number.isFinite(value) ? `${value}${unit}` : 'Unavailable';

const HourlyChart = ({ hours, field, label, unit, fixedScale }) => {
  const gradientId = useId();
  const [selected, setSelected] = useState(0);
  const active = Math.min(selected, hours.length - 1);
  const values = hours.map((hour) => hour[field]).filter(Number.isFinite);
  const minimum = fixedScale ? 0 : Math.floor(Math.min(...values, values[0] ?? 0) / 5) * 5 - 5;
  const maximum = fixedScale ? 100 : Math.ceil(Math.max(...values, values[0] ?? 0) / 5) * 5 + 5;
  const pointY = (value) => y(value, minimum, maximum);
  const selectPosition = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - bounds.left) / bounds.width * 700 - 52) / 596;
    setSelected(Math.max(0, Math.min(hours.length - 1, Math.round(position * (hours.length - 1)))));
  };

  return (
    <figure className={`hourly-chart hourly-chart--${fixedScale ? 'rain' : 'temperature'}`}>
      <figcaption className="chart-heading">
        <div><span className="chart-label">{label}</span><span className="chart-subtitle">{fixedScale ? 'Chance of precipitation' : 'Temperature throughout the day'}</span></div>
        <div className="chart-reading"><strong>{reading(hours[active]?.[field], unit)}</strong><span>{hours[active]?.time.slice(11, 16)} · Local time</span></div>
      </figcaption>
      {values.length ? (
        <>
          <div className="chart-scroll">
            <svg viewBox="0 0 700 230" onPointerMove={selectPosition} onPointerDown={selectPosition} role="img" aria-label={`${label}. Use the hour slider below to explore exact values.`}>
              <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity="0.24" /><stop offset="100%" stopColor="currentColor" stopOpacity="0.02" /></linearGradient></defs>
              {[0, 1, 2, 3, 4].map((tick) => (
                <g key={tick}>
                  <line x1="52" x2="648" y1={pointY(minimum + tick * (maximum - minimum) / 4)} y2={pointY(minimum + tick * (maximum - minimum) / 4)} className="chart-grid" />
                  <text x="42" y={pointY(minimum + tick * (maximum - minimum) / 4) + 4} textAnchor="end">{Math.round(minimum + tick * (maximum - minimum) / 4)}{unit}</text>
                </g>
              ))}
              {hours.map((hour, index) => (
                <g key={hour.time}>
                  {Number.isFinite(hour[field]) && (
                    fixedScale ? <rect x={x(index, hours.length) - 7} y={pointY(hour[field])} width="14" height={Math.max(2, 190 - pointY(hour[field]))} rx="5" fill="currentColor" opacity={index === active ? 1 : 0.4} /> : (
                      <>
                        {index > 0 && Number.isFinite(hours[index - 1][field]) && (
                          <>
                            <path d={`M ${x(index - 1, hours.length)} 190 L ${x(index - 1, hours.length)} ${pointY(hours[index - 1][field])} L ${x(index, hours.length)} ${pointY(hour[field])} L ${x(index, hours.length)} 190 Z`} fill={`url(#${gradientId})`} />
                            <line x1={x(index - 1, hours.length)} x2={x(index, hours.length)} y1={pointY(hours[index - 1][field])} y2={pointY(hour[field])} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </>
                        )}
                        <circle cx={x(index, hours.length)} cy={pointY(hour[field])} r={index === active ? 6 : 2.5} fill={index === active ? 'white' : 'currentColor'} stroke="currentColor" strokeWidth="3" />
                      </>
                    )
                  )}
                  {(index % 4 === 0 || index === hours.length - 1) && <text x={x(index, hours.length)} y="217" textAnchor="middle">{hour.time.slice(11, 16)}</text>}
                </g>
              ))}
              <line x1={x(active, hours.length)} x2={x(active, hours.length)} y1="25" y2="193" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 5" />
            </svg>
          </div>
          <label className="chart-slider-label">Explore by hour
            <input type="range" min="0" max={Math.max(0, hours.length - 1)} value={Math.max(0, active)} onChange={(event) => setSelected(Number(event.target.value))} aria-label={`${label}: select hour`} aria-valuetext={`${hours[active]?.time.slice(11, 16)}, ${reading(hours[active]?.[field], unit)}`} />
          </label>
        </>
      ) : <p className="muted">No readings available for this day.</p>}
    </figure>
  );
};

export default HourlyChart;
