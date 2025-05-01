// npm test -- src/__tests__/components/EventModal.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventModal from '../../components/EventModal';
import { cleanup } from '@testing-library/react';

describe('EventModal', () => {
  const baseFormData = {
    title: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    language: '',
    acceptsRSVP: false,
    maxParticipants: '',
    privacy: 'public',
    format: 'Physical',
    inviteLink: '',
    status: 'active',
    terms: '',
  };

  const renderModal = (overrides = {}) => {
    const props = {
      isOpen: true,
      modalTitle: 'Create Event',
      formData: { ...baseFormData, ...(overrides.formData || {}) },
      onChange: overrides.onChange || jest.fn(),
      onFileChange: overrides.onFileChange || jest.fn(),
      onSubmit: overrides.onSubmit || jest.fn(e => e.preventDefault()),
      onClose: overrides.onClose || jest.fn(),
    };
    render(<EventModal {...props} />);
    return props;
  };

  it('renders nothing when isOpen is false', () => {
    render(<EventModal isOpen={false} />);
    expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
  });

  it('renders all form fields when open', () => {
    renderModal();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '' })).toBeInTheDocument(); // CategorySelect's <select>
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Accepts RSVP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Featured Image/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Participants/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Privacy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Terms & Conditions/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Invite Link/i)).toBeNull();
  });

  it('shows inviteLink field when format is Online', () => {
    renderModal({ formData: { format: 'Online' } });
    expect(screen.getByLabelText(/Invite Link/i)).toBeInTheDocument();
  });

  it('calls onChange when text inputs change', () => {
    const onChange = jest.fn();
    renderModal({ onChange });

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { name: 'title', value: 'New Title' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    const eventArg = onChange.mock.calls[0][0];
    expect(eventArg.target.name).toBe('title');
  });

  it('calls onFileChange when file input changes', () => {
    const onFileChange = jest.fn();
    renderModal({ onFileChange });

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload Featured Image/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFileChange).toHaveBeenCalledTimes(1);
  });
//////////////////////
it('adds and removes categories via CategorySelect', () => {
    const onChange = jest.fn();
  
    // First render: no category selected
    renderModal({
      onChange,
      formData: { ...baseFormData, category: '' },
    });
  
    // Pick the first <select> (CategorySelect)
    const [categorySelect] = screen.getAllByRole('combobox');
    // Add "Business"
    fireEvent.change(categorySelect, { target: { value: 'Business' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { name: 'category', value: 'Business' },
      })
    );
  
    // Clear mock calls and unmount DOM
    onChange.mockClear();
    cleanup();
  
    // Second render: "Business" pre-selected
    renderModal({
      onChange,
      formData: { ...baseFormData, category: 'Business' },
    });
  
    // Click the × button to remove "Business"
    const removeBtn = screen.getByRole('button', { name: '×' });
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { name: 'category', value: '' },
      })
    );
  });
//////////////////////////
  it('calls onSubmit when form is submitted', () => {
    const onSubmit = jest.fn(e => e.preventDefault());
    renderModal({ onSubmit });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
