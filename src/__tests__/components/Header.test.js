// npm test -- src/__tests__/components/Header.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../components/Header';

describe('Header component', () => {
  it('renders as a landmark banner', () => {
    render(<Header />);
    // <header> has an implicit "banner" role
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
  });

  it('displays the main title and subtitle', () => {
    render(<Header />);
    // Main title
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Welcome to DiverseEvents');
    // Subtitle paragraph
    expect(
      screen.getByText('Your ultimate event management solution')
    ).toBeInTheDocument();
  });

  it('applies the correct Tailwind CSS classes', () => {
    const { container } = render(<Header />);
    const headerElem = container.querySelector('header');
    expect(headerElem).toHaveClass(
      'bg-blue-600',
      'text-white',
      'p-8',
      'text-center',
      'shadow-lg'
    );

    const heading = container.querySelector('h1');
    expect(heading).toHaveClass('text-5xl', 'font-bold');

    const subtitle = container.querySelector('p');
    expect(subtitle).toHaveClass('mt-4', 'text-2xl');
  });
});
