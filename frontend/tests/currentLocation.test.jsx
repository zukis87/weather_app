import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import App from '../app.jsx';
import { getWeather } from '../api.js';

vi.mock('../api.js', () => ({ getWeather: vi.fn(), searchCities: vi.fn() }));
const weather = { temperature: 22, humidity: 60, time: '2026-09-21T12:00', forecast: [], hourly: [] };
const mockLocation = (implementation) => {
  const getCurrentPosition = vi.fn(implementation);
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
  return getCurrentPosition;
};
beforeEach(() => localStorage.clear());

it('requests permission only on click and loads coordinates without changing city search', async () => {
  const user = userEvent.setup();
  let resolve;
  const locate = mockLocation((success) => { resolve = success; });
  getWeather.mockResolvedValue(weather);
  render(<App />);
  expect(locate).not.toHaveBeenCalled();
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(screen.getByRole('tab', { name: 'My location' })).toHaveAttribute('aria-selected', 'true');
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(locate).toHaveBeenCalledTimes(1);
  resolve({ coords: { latitude: 0, longitude: 0 } });
  expect(await screen.findByRole('region', { name: 'Current weather' })).toHaveTextContent('My location');
  expect(getWeather).toHaveBeenCalledWith({ name: 'My location', latitude: 0, longitude: 0 });
  await user.click(screen.getByRole('tab', { name: 'Find a city' }));
  expect(screen.getByRole('textbox', { name: 'Find a city' })).toHaveValue('Tel Aviv');
});

it.each([[1, 'permission was denied'], [2, 'location is unavailable'], [3, 'timed out']])('handles location error %s and permits retry', async (code, message) => {
  const user = userEvent.setup();
  mockLocation((success, failure) => failure({ code }));
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(getWeather).not.toHaveBeenCalled();
  expect(screen.getByRole('tab', { name: 'My location' })).toBeEnabled();
});

it('handles unsupported browsers', async () => {
  const user = userEvent.setup();
  vi.stubGlobal('navigator', {});
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('does not support location');
});

it('reports weather failures after locating and allows another attempt', async () => {
  const user = userEvent.setup();
  mockLocation((success) => success({ coords: { latitude: 32, longitude: 34 } }));
  getWeather.mockRejectedValue(new Error('Weather unavailable'));
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Weather unavailable');
  expect(screen.getByRole('tab', { name: 'My location' })).toBeEnabled();
});

it('includes the location tab in keyboard navigation', async () => {
  const user = userEvent.setup();
  mockLocation((success, failure) => failure({ code: 1 }));
  render(<App />);
  screen.getByRole('tab', { name: 'Find a city' }).focus();
  await user.keyboard('{End}');
  expect(screen.getByRole('tab', { name: 'My location' })).toHaveFocus();
  expect(screen.getByRole('tabpanel', { name: 'My location' })).toBeVisible();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Find a city' })).toHaveFocus();
});

it('allows a longer location lookup and reuses a recent browser position', async () => {
  const user = userEvent.setup();
  const locate = mockLocation((success) => success({ coords: { latitude: 32, longitude: 34 } }));
  getWeather.mockResolvedValue(weather);
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(locate).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
    enableHighAccuracy: false, timeout: 30000, maximumAge: 300000,
  });
  await screen.findByRole('region', { name: 'Current weather' });
});

it('retries after a timeout using the explicit retry button', async () => {
  const user = userEvent.setup();
  const locate = mockLocation((success, failure) => failure({ code: 3 }));
  getWeather.mockResolvedValue(weather);
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'My location' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('location services');
  locate.mockImplementationOnce((success) => success({ coords: { latitude: 32, longitude: 34 } }));
  await user.click(screen.getByRole('button', { name: 'Try my location again' }));
  expect(await screen.findByRole('region', { name: 'Current weather' })).toHaveTextContent('My location');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(locate).toHaveBeenCalledTimes(2);
});
