//npm test -- src/__tests__/pages/notification/Notifications.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Notifications from '../../../pages/notification/Notifications';
import * as apiService from '../../../api/apiService';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../../api/apiService', () => ({
  getAllData: jest.fn(),
  patchData: jest.fn(),
}));

describe('Notifications', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('filters unread notifications', async () => {
    apiService.getAllData.mockResolvedValueOnce([
      {
        id: 'notif-1',
        type: 'event_invite',
        message: 'Invite!',
        read: true,
        createdAt: { _seconds: Math.floor(Date.now() / 1000) },
      },
      {
        id: 'notif-2',
        type: 'event_invite',
        message: 'New Invite!',
        read: false,
        createdAt: { _seconds: Math.floor(Date.now() / 1000) },
      },
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <Notifications />
        </MemoryRouter>
      );
    });

    // Should show both initially
    await waitFor(() => {
      const initial = screen.getAllByText(/invite/i).filter(
        el => el.tagName.toLowerCase() === 'h4' || el.tagName.toLowerCase() === 'p'
      );
      expect(initial).toHaveLength(4); // h4 + p for each
    });

    // Click UNREAD tab
    fireEvent.click(screen.getByText(/📬 UNREAD/i));

    // Should show only 1 unread notification
    await waitFor(() => {
      const filtered = screen.getAllByText(/invite/i).filter(
        el => el.tagName.toLowerCase() === 'h4' || el.tagName.toLowerCase() === 'p'
      );
      expect(filtered).toHaveLength(2); // h4 + p for unread only
    });
  });
});
