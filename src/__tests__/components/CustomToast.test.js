//npm test -- src/__tests__/components/CustomToast.test.js
import React from 'react';
import { render } from '@testing-library/react';

// Mock react-toastify BEFORE importing CustomToast
jest.mock('react-toastify', () => ({
  ToastContainer: jest.fn(() => null),
}));

// import CustomToast and the mock
import CustomToast from '../../components/CustomToast';
import { ToastContainer } from 'react-toastify';

describe('CustomToast', () => {
  beforeEach(() => {
    ToastContainer.mockClear();
  });

  it('calls ToastContainer once with default props', () => {
    render(<CustomToast />);

    // Ensure it was rendered exactly once
    expect(ToastContainer).toHaveBeenCalledTimes(1);

    // Grab the props object from the first call
    const props = ToastContainer.mock.calls[0][0];

    // Assert all default values
    expect(props).toEqual({
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      newestOnTop: false,
      closeOnClick: true,
      rtl: false,
      draggable: true,
      pauseOnHover: true,
      theme: 'light',
    });
  });

  it('overrides position and autoClose when provided', () => {
    render(<CustomToast position="bottom-left" autoClose={5000} />);

    expect(ToastContainer).toHaveBeenCalledTimes(1);
    const props = ToastContainer.mock.calls[0][0];

    expect(props.position).toBe('bottom-left');
    expect(props.autoClose).toBe(5000);
  });
});
