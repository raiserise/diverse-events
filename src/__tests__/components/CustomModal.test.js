//npm test -- src/__tests__/components/CustomModal.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// MOCK react-modal BEFORE importing CustomModal
jest.mock('react-modal', () => {
  const React = require('react');
  // stub Modal: only render children when isOpen, and call onRequestClose on Escape
  const Modal = ({ isOpen, children, onRequestClose }) =>
    isOpen ? (
      <div data-testid="modal" onKeyDown={e => e.key === 'Escape' && onRequestClose()}>
        {children}
      </div>
    ) : null;
  // stub out setAppElement so no global error
  Modal.setAppElement = () => {};
  return Modal;
});

// Now import the component under test
import CustomModal from '../../components/CustomModal';

describe('CustomModal', () => {
  it('does not render its children when isOpen=false', () => {
    render(
      <CustomModal isOpen={false} onRequestClose={jest.fn()}>
        <p>Hidden Content</p>
      </CustomModal>
    );
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });

  it('renders its children when isOpen=true', () => {
    render(
      <CustomModal isOpen={true} onRequestClose={jest.fn()}>
        <p>Visible Content</p>
      </CustomModal>
    );
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
    // ensure stub modal wrapper is in the DOM
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('calls onRequestClose when Escape is pressed', () => {
    const onRequestClose = jest.fn();
    render(
      <CustomModal isOpen={true} onRequestClose={onRequestClose}>
        <p>Press Escape</p>
      </CustomModal>
    );
    // focus the modal container and dispatch Escape
    const modal = screen.getByTestId('modal');
    modal.focus?.(); // if needed
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
