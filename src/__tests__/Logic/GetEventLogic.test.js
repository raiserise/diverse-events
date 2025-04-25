// npm test -- src/__tests__/Logic/GetEventLogic.test.js
import GetEventLogic from '../../Logic/EventsLogic/GetEventLogic';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { getAllData } from '../../api/apiService';
import { useSearchParams } from 'react-router-dom';

jest.mock('../../api/apiService', () => ({
  getAllData: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

// A little test component that exposes the hook's return values via data-testids
function TestHarness() {
  const {
    loading,
    error,
    events,
    publicEvent,
    privateEvent,
    onlineEvent,
    offlineEvent,
    filter,
  } = GetEventLogic();

  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || ''}</div>
      <div data-testid="events-count">{events.length}</div>
      <div data-testid="public-count">{publicEvent.length}</div>
      <div data-testid="private-count">{privateEvent.length}</div>
      <div data-testid="online-count">{onlineEvent.length}</div>
      <div data-testid="offline-count">{offlineEvent.length}</div>
      <div data-testid="filter">{filter}</div>
    </div>
  );
}

describe('GetEventLogic (w/o react-hooks)', () => {
  let setSearchParams;
  let searchParams;

  beforeEach(() => {
    jest.clearAllMocks();

    // mock out useSearchParams
    setSearchParams = jest.fn();
    searchParams = {
      get: jest.fn().mockReturnValue(undefined),  // default → 'total'
    };
    useSearchParams.mockReturnValue([searchParams, setSearchParams]);
  });

  it('loads events and computes all categories, default filter', async () => {
    const fake = [
      { id: 1, privacy: 'public',  medium: 'online'  },
      { id: 2, privacy: 'private', medium: 'offline' },
      { id: 3, privacy: 'public',  medium: 'offline' },
    ];
    getAllData.mockResolvedValueOnce(fake);

    render(<TestHarness />);

    // initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // wait for fetch to finish
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // no error
    expect(screen.getByTestId('error')).toHaveTextContent('');

    // raw events count
    expect(screen.getByTestId('events-count')).toHaveTextContent('3');
    // public/private splits
    expect(screen.getByTestId('public-count')).toHaveTextContent('2');
    expect(screen.getByTestId('private-count')).toHaveTextContent('1');
    // online/offline splits
    expect(screen.getByTestId('online-count')).toHaveTextContent('1');
    expect(screen.getByTestId('offline-count')).toHaveTextContent('2');
    // default filter
    expect(screen.getByTestId('filter')).toHaveTextContent('total');

    // ensure we called the API
    expect(getAllData).toHaveBeenCalledWith('/events', true);
  });

  it('respects a filter from the URL', async () => {
    searchParams.get.mockReturnValue('private');
    getAllData.mockResolvedValueOnce([]);
    render(<TestHarness />);

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    );
    expect(screen.getByTestId('filter')).toHaveTextContent('private');
  });

  it('catches and surfaces errors', async () => {
    getAllData.mockRejectedValueOnce(new Error('Oops'));
    render(<TestHarness />);

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    );
    expect(screen.getByTestId('error')).toHaveTextContent('Oops');
    expect(screen.getByTestId('events-count')).toHaveTextContent('0');
  });
});
