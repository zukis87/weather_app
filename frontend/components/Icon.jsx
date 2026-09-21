import React from 'react';

const icons = {
  search: '🔍',
  star: '★',
  globe: '🌐',
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  foggy: '🌫️',
  stormy: '⛈️',
  night: '🌙',
  unknown: '🌡️',
  pin: '📍',
  close: '×',
  wind: '💨',
  drop: '💧',
};

const Icon = ({ name, className = '', size = 24 }) => (
  <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">
    {icons[name] ?? icons.unknown}
  </span>
);

export default Icon;
