//npm test -- src/__tests__/components/DeleteEventsModal.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteEventModal from '../../components/DeleteEventsModal';

describe('DeleteEventModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDelete: jest.fn(),
    eventTitle: 'Sample Event',
  };

  it('renders nothing when isOpen is false', () => {
    render(<DeleteEventModal {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByText(/Are you sure you want to delete this event\?/i)
    ).not.toBeInTheDocument();
  });

  it('renders all modal content when open', () => {
    render(<DeleteEventModal {...defaultProps} />);

    // Heading
    expect(
      screen.getByText(/Are you sure you want to delete this event\?/i)
    ).toBeInTheDocument();

    // Action items list
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);

    expect(items[0]).toHaveTextContent(
      "Remove Sample Event from everyone's view"
    );
    expect(items[1]).toHaveTextContent('Delete all associated RSVPs');
    expect(items[2]).toHaveTextContent(
      "Notify RSVP'd users that the event was cancelled"
    );

    // Warning text
    expect(screen.getByText(/This cannot be undone\./i)).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole('button', { name: /No, Keep Event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yes, Delete Event/i })).toBeInTheDocument();
  });

  it('calls onClose when "No, Keep Event" is clicked', () => {
    const onClose = jest.fn();
    render(
      <DeleteEventModal
        {...defaultProps}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /No, Keep Event/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when "Yes, Delete Event" is clicked', () => {
    const onDelete = jest.fn();
    render(
      <DeleteEventModal
        {...defaultProps}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Yes, Delete Event/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
