import React from 'react';
import { vi } from 'vitest';
vi.mock('react-toastify');
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';
import { describe, it, expect } from 'vitest';

// Ukázkový unit test pro komponentu Home

describe('Home komponenta', () => {
  it('zobrazí titulek ServisKol', () => {
    render(<Home />);
    const elements = screen.getAllByText(/ServisKol/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
