import React, { useId } from 'react';

const DaylightArc = ({ progress, isDaytime }) => {
  const gradientId = useId();
  const position = progress / 100;
  const sunX = 48 + 384 * position;
  const sunY = 170 - 520 * position * (1 - position);

  return (
    <svg className="mx-auto mt-3 -mb-3 block w-full max-w-[480px]" viewBox="0 0 480 208" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4c063" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#f4c063" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d="M48 170 Q240 -90 432 170 Z" fill={`url(#${gradientId})`} />
      <path className="fill-none stroke-[#ddccb0] stroke-2 [stroke-dasharray:4_7]" d="M48 170 Q240 -90 432 170" />
      <path pathLength="1" className="daylight-draw fill-none stroke-[#cf9136] stroke-3 [stroke-linecap:round]" d={`M48 170 Q${48 + 192 * position} ${170 - 260 * position} ${sunX} ${sunY}`} />
      <line className="stroke-[#e1d3bb] stroke-1" x1="28" x2="452" y1="170" y2="170" />
      <circle className="fill-[#b48c53]" cx="48" cy="170" r="4" />
      <circle className="fill-[#b48c53]" cx="432" cy="170" r="4" />
      <g transform={`translate(${sunX} ${sunY})`} opacity={isDaytime ? 1 : 0.55}>
        <circle className="daylight-glow fill-[#f7d991] [fill-opacity:0.45]" r="27" />
        {Array.from({ length: 8 }, (_, index) => (
          <line key={index} className="stroke-[#cb8d23] stroke-2 [stroke-linecap:round]" y1="-17" y2="-21" transform={`rotate(${index * 45})`} />
        ))}
        <circle className="fill-[#f7c652] stroke-[#cb8d23] stroke-[1.5]" r="11" />
      </g>
    </svg>
  );
};

export default DaylightArc;
