import { render, screen } from '@testing-library/react';
import Help from './Help';

describe('Help FAQ', () => {
  it('zobrazuje všechny FAQ položky', () => {
    render(<Help />);
    expect(screen.getByText(/Jak přidám nové kolo/i)).toBeInTheDocument();
    expect(screen.getByText(/Jak funguje servisní kniha/i)).toBeInTheDocument();
    expect(screen.getByText(/Co je AI dotazník/i)).toBeInTheDocument();
    expect(screen.getByText(/Jak získám věrnostní body/i)).toBeInTheDocument();
    expect(screen.getByText(/Jak kontaktovat technika/i)).toBeInTheDocument();
    expect(screen.getByText(/Jak exportuji data/i)).toBeInTheDocument();
  });
});
