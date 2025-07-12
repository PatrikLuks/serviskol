
import React from 'react';
import { vi } from 'vitest';
vi.mock('react-toastify');
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../pages/Home';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Mock fetch pro všechny testy této komponenty
beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn((url) => {
    if (url.includes('/api/integrations/weather')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ temp: 20, desc: 'slunečno' })
      });
    }
    if (url.includes('/api/gamification/leaderboard')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    }
    if (url.includes('/api/gamification/rewards')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    }
    if (url.includes('/api/export/service-history')) {
      return Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(["test"], { type: 'text/csv' }))
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }));
});
afterAll(() => {
  vi.unstubAllGlobals();
});

// Ukázkový unit test pro komponentu Home

describe('Home komponenta', () => {
  it('zobrazí titulek ServisKol', async () => {
    render(<Home />);
    await waitFor(() => {
      const elements = screen.getAllByText(/ServisKol/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
