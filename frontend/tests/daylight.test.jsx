import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { daylight, minutes } from '../daylight.js';
import DaylightTimeline from '../components/DaylightTimeline.jsx';

it.each([
  ['05:00', 'Before sunrise', 720, 0],
  ['06:00', 'Daylight', 720, 0],
  ['12:00', 'Daylight', 360, 50],
  ['18:00', 'After sunset', 0, 100],
  ['20:00', 'After sunset', 0, 100],
])('calculates city-local daylight at %s', (time, phase, remaining, progress) => {
  expect(daylight('06:00', '18:00', `2026-09-21 ${time}`)).toMatchObject({
    duration: 720,
    remaining,
    progress,
    phase,
  });
});

it.each([
  ['00:00', 0],
  ['23:59', 1439],
  ['24:00', null],
  ['06:60', null],
  ['6:00', null],
  ['', null],
  [null, null],
  [undefined, null],
])('validates a local clock time %s', (time, expected) => {
  expect(minutes(time)).toBe(expected);
});

it.each([
  ['05:00', 'Before sunrise', '12h 0m'],
  ['12:00', 'Daylight', '6h 0m'],
  ['20:00', 'After sunset', '0h 0m'],
])('shows daylight values for the observation at %s', (time, phase, remaining) => {
  render(<DaylightTimeline weather={{ sunrise: '06:00', sunset: '18:00', time: `2026-09-21 ${time}` }} />);

  const timeline = within(screen.getByRole('region', { name: 'Daylight timeline' }));
  expect(timeline.getByText('Sunrise')).toBeVisible();
  expect(timeline.getByText('06:00')).toBeVisible();
  expect(timeline.getByText('Sunset')).toBeVisible();
  expect(timeline.getByText('18:00')).toBeVisible();
  const totalDaylight = within(timeline.getByText('Total daylight').parentElement).getByRole('definition');
  const daylightRemaining = within(timeline.getByText('Daylight remaining').parentElement).getByRole('definition');
  expect(totalDaylight).toBeVisible();
  expect(totalDaylight).toHaveTextContent(/^12h 0m$/);
  expect(daylightRemaining).toBeVisible();
  expect(daylightRemaining).toHaveTextContent(remaining);
  expect(timeline.getByText(phase)).toBeVisible();
});

it.each([
  { time: '2026-09-21 12:00' },
  { sunrise: '06:00', sunset: '18:00' },
  { sunrise: '25:00', sunset: '18:00', time: '2026-09-21 12:00' },
  { sunrise: '06:00', sunset: 'invalid', time: '2026-09-21 12:00' },
  { sunrise: '06:00', sunset: '18:00', time: 'invalid' },
  { sunrise: '18:00', sunset: '06:00', time: '2026-09-21 12:00' },
  { sunrise: '06:00', sunset: '06:00', time: '2026-09-21 12:00' },
])('shows unavailable daylight when times are missing or invalid: %j', (weather) => {
  expect(daylight(weather.sunrise, weather.sunset, weather.time)).toBeNull();
  render(<DaylightTimeline weather={weather} />);

  const timeline = within(screen.getByRole('region', { name: 'Daylight timeline' }));
  expect(timeline.getByText('Daylight timeline unavailable for this location.')).toBeVisible();
  expect(timeline.queryByText('Total daylight')).not.toBeInTheDocument();
  expect(timeline.queryByText('Daylight remaining')).not.toBeInTheDocument();
});
