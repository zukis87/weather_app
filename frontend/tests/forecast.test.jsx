import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import ForecastExplorer from '../components/ForecastExplorer.jsx';

it('shows weekly and hourly forecasts without an outdoor recommendation', () => {
  render(<ForecastExplorer weather={{
    time: '2026-09-21 12:00',
    forecast: [{ date: '2026-09-21', weather_code: 0 }],
    hourly: [{ time: '2026-09-21T14:00', temperature: 21, precipitation_probability: 0 }],
  }} />);

  expect(screen.getByRole('region', { name: '7-day forecast' })).toBeVisible();
  expect(screen.getByRole('region', { name: 'Hourly forecast' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Best time to go outside' })).not.toBeInTheDocument();
});

it('switches hourly data by city-local date and supports keyboard selection', async () => {
  const user = userEvent.setup();
  render(<ForecastExplorer weather={{
    time: '2026-09-17 12:00',
    forecast: ['2026-09-17', '2026-09-18', '2026-09-19'].map((date) => ({ date, weather_code: 0 })),
    hourly: [
      { time: '2026-09-17T00:00', temperature: 12, precipitation_probability: 0 },
      { time: '2026-09-18T00:00', temperature: 28, precipitation_probability: 70 },
    ],
  }} />);
  const region = () => within(screen.getByRole('region', { name: 'Hourly forecast' }));
  expect(region().getByRole('slider', { name: 'Temperature: select hour' })).toHaveAttribute('aria-valuetext', '00:00, 12°C');
  await user.click(screen.getByRole('button', { name: 'Show hourly forecast for 2026-09-18' }));
  expect(screen.getByRole('button', { name: 'Show hourly forecast for 2026-09-18' })).toHaveAttribute('aria-pressed', 'true');
  expect(region().getByRole('slider', { name: 'Temperature: select hour' })).toHaveAttribute('aria-valuetext', '00:00, 28°C');
  await user.tab();
  await user.keyboard('{Enter}');
  expect(region().getByText('Hourly forecast is unavailable for this location.')).toBeInTheDocument();
  expect(region().queryByRole('slider')).not.toBeInTheDocument();
});
