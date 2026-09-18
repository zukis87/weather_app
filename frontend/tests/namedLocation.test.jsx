import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import App from '../app.jsx';
import { FAVORITES_KEY } from '../hooks/useFavorites.js';

vi.mock('../components/GlobeCanvas.jsx', () => ({ default: ({ onSelect }) => <button onClick={() => onSelect({ lat: 10, lng: -20 })}>Pick point</button> }));

it('persists the chosen name and shows it in favorites after reload', async () => {
  localStorage.clear();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null });
  const user = userEvent.setup();
  const view = render(<App />);
  await user.click(screen.getByRole('tab', { name: 'Globe' }));
  await user.click(await screen.findByRole('button', { name: 'Pick point' }));
  await user.click(screen.getByRole('button', { name: '☆ Save location' }));
  await user.type(screen.getByRole('textbox', { name: 'Location name' }), 'Holiday spot');
  await user.click(screen.getByRole('button', { name: 'Save to favorites' }));
  expect(JSON.parse(localStorage.getItem(FAVORITES_KEY))).toEqual([{ name: 'Holiday spot', latitude: 10, longitude: -20 }]);
  view.unmount();
  render(<App />);
  expect(screen.getByRole('button', { name: 'Load weather for Holiday spot' })).toBeVisible();
  localStorage.clear();
});
