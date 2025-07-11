import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '../components/Leaderboard';
import { vi } from 'vitest';

// Mock fetch pro Leaderboard
beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { user: { _id: '1', name: 'Alice' }, points: 100 },
        { user: { _id: '2', name: 'Bob' }, points: 80 },
      ])
    })
  ));
});
afterAll(() => {
  vi.unstubAllGlobals();
});

describe('Leaderboard komponenta', () => {
  it('zobrazí žebříček uživatelů', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
      expect(screen.getByText(/100 bodů/)).toBeInTheDocument();
      expect(screen.getByText(/80 bodů/)).toBeInTheDocument();
    });
  });
});
