import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import HourlyForecast from '../components/HourlyForecast.jsx';

it('shows both interactive charts without the hourly values table', () => {
  render(<HourlyForecast date="2026-09-21" hours={[{ time: '2026-09-21T12:00', temperature: 22, precipitation_probability: 10 }]} />);
  expect(screen.getByRole('slider', { name: 'Temperature: select hour' })).toBeVisible();
  expect(screen.getByRole('slider', { name: 'Precipitation probability: select hour' })).toBeVisible();
  expect(screen.queryByText('View hourly values')).not.toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
