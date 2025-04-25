// npm test -- src/__tests__/components/NavBar.test.js
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../../components/NavBar';

describe('Navbar', () => {
  // freeze time at Dec 25, 2025 13:05:45
  const FIXED_DATE = new Date('2025-12-25T13:05:45');

  beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the pageTitle and the formatted date/time', () => {
    render(<Navbar pageTitle="My Page" />);

    // pageTitle
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Page');

    // formatted date
    const expectedDate = FIXED_DATE.toLocaleDateString('en-US', {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    expect(screen.getByText(expectedDate)).toBeInTheDocument();

    // formatted time
    const expectedTime = FIXED_DATE.toLocaleTimeString('en-US', {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
    expect(screen.getByText(expectedTime)).toBeInTheDocument();
  });

  it('updates the time display every second', () => {
    render(<Navbar pageTitle="Tick Tock" />);

    const format = {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };

    // initial time
    const firstTime = FIXED_DATE.toLocaleTimeString('en-US', format);
    expect(screen.getByText(firstTime)).toBeInTheDocument();

    // advance by one second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const nextDate = new Date(FIXED_DATE.getTime() + 1000);
    const nextTime = nextDate.toLocaleTimeString('en-US', format);
    expect(screen.getByText(nextTime)).toBeInTheDocument();
  });
});
