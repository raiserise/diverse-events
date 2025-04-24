// src/pages/events/__tests__/Events.test.js
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Events from '../../../pages/events/Events';
import * as apiService from '../../../api/apiService';

// Mock the getAllData function
jest.mock('../../../api/apiService', () => ({
  getAllData: jest.fn(),
}));

// Mock child components
jest.mock('../../../components/EventCard', () => ({ event }) => (
  <div data-testid="event-card">{event.title}</div>
));

jest.mock('../../../components/EventsFilter', () => ({ onSearchChange, onFormatChange }) => (
  <div>
    <button onClick={() => onSearchChange('sample')}>Search Sample</button>
    <button onClick={() => onFormatChange('Online')}>Filter Online</button>
  </div>
));

describe('Events component', () => {
  it('renders events after successful fetch', async () => {
    // Mock successful fetch
    apiService.getAllData.mockResolvedValueOnce([
      { id: '1', title: 'Sample Event', format: 'Online' },
      { id: '2', title: 'Another Event', format: 'Offline' },
    ]);

    render(<Events />);

    // Initially shows loading
    expect(screen.getByText(/Loading events/i)).toBeInTheDocument();

    // Wait for events to render
    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(2);
    });

    // Should render event titles
    expect(screen.getByText(/Sample Event/i)).toBeInTheDocument();
    expect(screen.getByText(/Another Event/i)).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    apiService.getAllData.mockRejectedValueOnce(new Error('Network error'));

    render(<Events />);

    expect(screen.getByText(/Loading events/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('filters events based on format and search query', async () => {
    apiService.getAllData.mockResolvedValueOnce([
      { id: '1', title: 'Sample Event', format: 'Online' },
      { id: '2', title: 'Offline Meetup', format: 'Offline' },
    ]);
  
    render(<Events />);
  
    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(2);
    });
  
    await act(async () => {
      screen.getByText('Search Sample').click();
      screen.getByText('Filter Online').click();
    });
  
    await waitFor(() => {
      const cards = screen.getAllByTestId('event-card');
      expect(cards).toHaveLength(1);
      expect(cards[0]).toHaveTextContent('Sample Event');
    });
  });
});
