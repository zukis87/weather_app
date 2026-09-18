import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import GlobePicker, { coordinateLocation } from '../components/GlobePicker.jsx';

vi.mock('../components/GlobeCanvas.jsx', () => ({ default: ({ onSelect, disabled }) => <button disabled={disabled} onClick={() => onSelect({ lat: 0, lng: -30 })}>Select ocean point</button> }));

it('previews a coordinate without loading, confirms, and preserves the selection for retry', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null });
  const user = userEvent.setup();
  const onLoad = vi.fn();
  const view = render(<GlobePicker busy="" onLoad={onLoad} />);
  expect(screen.getByRole('button', { name: 'Show weather here' })).toBeDisabled();
  await user.click(await screen.findByRole('button', { name: 'Select ocean point' }));
  expect(onLoad).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Show weather here' }));
  expect(onLoad).toHaveBeenCalledWith({ name: '0.000°, -30.000°', latitude: 0, longitude: -30 });
  view.rerender(<GlobePicker busy="weather" onLoad={onLoad} />);
  expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled();
  view.rerender(<GlobePicker busy="" onLoad={onLoad} />);
  expect(screen.getByText('Selected: 0.000°, -30.000°')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show weather here' })).toBeEnabled();
});

it('provides a fallback when WebGL is unavailable', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  render(<GlobePicker busy="" onLoad={vi.fn()} />);
  expect(screen.getByRole('status')).toHaveTextContent('Use the Find a city tab');
});

it('preserves coordinate signs and rounds labels consistently', () => expect(coordinateLocation({ lat: -89.12345, lng: 179.12345 })).toEqual({ name: '-89.123°, 179.123°', latitude: -89.123, longitude: 179.123 }));

it('saves the selected pin before weather is loaded and prevents duplicate saving', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null });
  const user = userEvent.setup();
  const favorites = { add: vi.fn(), contains: vi.fn().mockReturnValue(false) };
  const onLoad = vi.fn();
  const view = render(<GlobePicker busy="" onLoad={onLoad} favorites={favorites} />);
  expect(screen.queryByRole('button', { name: '☆ Save location' })).not.toBeInTheDocument();
  await user.click(await screen.findByRole('button', { name: 'Select ocean point' }));
  expect(screen.queryByRole('textbox', { name: 'Location name' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '☆ Save location' }));
  expect(screen.getByRole('textbox', { name: 'Location name' })).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Save to favorites' })).toBeDisabled();
  await user.type(screen.getByRole('textbox', { name: 'Location name' }), '   ');
  expect(screen.getByRole('button', { name: 'Save to favorites' })).toBeDisabled();
  await user.clear(screen.getByRole('textbox', { name: 'Location name' }));
  await user.type(screen.getByRole('textbox', { name: 'Location name' }), '  Ocean getaway  ');
  await user.click(screen.getByRole('button', { name: 'Save to favorites' }));
  expect(favorites.add).toHaveBeenCalledWith({ name: 'Ocean getaway', latitude: 0, longitude: -30 });
  expect(onLoad).not.toHaveBeenCalled();
  favorites.contains.mockReturnValue(true);
  view.rerender(<GlobePicker busy="" onLoad={onLoad} favorites={favorites} />);
  expect(screen.getByRole('button', { name: '★ Saved' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: '☆ Save city' })).not.toBeInTheDocument();
});
