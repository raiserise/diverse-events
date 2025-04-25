// npm test -- src/__tests__/components/Footer.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer component', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    // The <footer> element should be present and have role="contentinfo"
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('displays the correct copyright text', () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2021 Diverse Events\. All rights reserved\./i)
    ).toBeInTheDocument();
  });

  it('applies the appropriate styling classes', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-gray-800', 'text-white', 'p-4', 'text-center');
  });
});
