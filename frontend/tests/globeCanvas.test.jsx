import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import GlobeCanvas from '../components/GlobeCanvas.jsx';

vi.mock('react-globe.gl', () => ({ default: ({ onGlobeClick }) => <button onClick={() => onGlobeClick({ lat: 10, lng: 20 })}>Earth surface</button> }));

it('ignores a drag and accepts a stationary click', () => {
  vi.stubGlobal('ResizeObserver', class { observe = vi.fn(); disconnect = vi.fn(); });
  vi.stubGlobal('PointerEvent', MouseEvent);
  const onSelect = vi.fn();
  const view = render(<GlobeCanvas location={null} onSelect={onSelect} disabled={false} />);
  const surface = screen.getByRole('button', { name: 'Earth surface' });
  fireEvent.pointerDown(surface, { clientX: 10, clientY: 10 });
  fireEvent.pointerMove(surface, { clientX: 60, clientY: 10 });
  fireEvent.click(surface);
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.pointerDown(surface, { clientX: 10, clientY: 10 });
  fireEvent.click(surface);
  expect(onSelect).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  onSelect.mockClear();
  view.rerender(<GlobeCanvas location={null} onSelect={onSelect} disabled />);
  fireEvent.click(surface);
  expect(onSelect).not.toHaveBeenCalled();
});
