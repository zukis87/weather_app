// WMO codes: https://open-meteo.com/en/docs
const conditions = [
  { codes: [0, 1], theme: 'sunny', icon: '☀️', label: 'Clear skies' },
  { codes: [2], theme: 'cloudy', icon: '⛅', label: 'Partly cloudy' },
  { codes: [3], theme: 'cloudy', icon: '☁️', label: 'Overcast' },
  { codes: [45, 48], theme: 'foggy', icon: '🌫️', label: 'Fog' },
  { codes: [51, 53, 55, 56, 57], theme: 'rainy', icon: '🌧️', label: 'Drizzle' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], theme: 'rainy', icon: '🌧️', label: 'Rain' },
  { codes: [71, 73, 75, 77, 85, 86], theme: 'snowy', icon: '❄️', label: 'Snow' },
  { codes: [95, 96, 99], theme: 'stormy', icon: '⛈️', label: 'Thunderstorm' },
];

const unknown = { theme: 'unknown', icon: '🌡️', label: 'Conditions unavailable' };
const night = { theme: 'night', icon: '🌙', label: 'Clear night' };

export const getWeatherAppearance = (code, isDay) => (
  [0, 1].includes(code) && isDay === 0
    ? night
    : conditions.find(({ codes }) => codes.includes(code)) ?? unknown
);
