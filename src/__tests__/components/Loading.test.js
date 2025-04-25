// npm test -- src/__tests__/components/Loading.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the icon module virtually and forward props
jest.mock(
  'react-icons/ai',
  () => ({
    AiOutlineLoading: (props) => <svg {...props} data-testid="spinner" />,
  }),
  { virtual: true }
);

import Loading from '../../components/Loading';

describe('Loading component', () => {
  it('renders a spinner SVG with the animate-spin class', () => {
    render(<Loading text="Loading data..." />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders the provided text', () => {
    render(<Loading text="Please wait" />);
    const textNode = screen.getByText('Please wait');
    expect(textNode).toBeInTheDocument();
    expect(textNode).toHaveClass('text-xl');
  });

  it('uses the correct container styling', () => {
    const { container } = render(<Loading text="Loading..." />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      'w-full',
      'h-full',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'min-h-[80vh]'
    );
  });
});
