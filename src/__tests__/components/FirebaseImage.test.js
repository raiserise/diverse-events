//  npm test -- src/__tests__/components/FirebaseImage.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import FirebaseImage from '../../components/FirebaseImage';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  getDownloadURL: jest.fn(),
}));

describe('FirebaseImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Make getStorage return a real object so ref(storage, path) gets "{}"
    getStorage.mockReturnValue({});
  });

  afterEach(cleanup);

  it('fetches the download URL and displays the image, hiding the skeleton after load', async () => {
    // Suppress the component's console.error call during this test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    getDownloadURL.mockResolvedValue('http://example.com/test.jpg');

    const { container } = render(
      <FirebaseImage path="images/test.jpg" alt="Test Image" className="custom-class" />
    );

    // Initially, skeleton loader should be in the DOM
    expect(container.querySelector('.react-loading-skeleton')).toBeInTheDocument();

    // Wait for the <img> to appear
    const img = await screen.findByRole('img');
    expect(img).toHaveAttribute('src', 'http://example.com/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image');
    expect(img.className).toContain('opacity-0');

    // Simulate the image's load event
    fireEvent.load(img);

    // After load: skeleton gone, opacity-100 applied
    await waitFor(() => {
      expect(container.querySelector('.react-loading-skeleton')).toBeNull();
      expect(img.className).toContain('opacity-100');
    });

    // Verify Firebase Storage API calls
    expect(getStorage).toHaveBeenCalled();
    expect(ref).toHaveBeenCalledWith({}, 'images/test.jpg');
    expect(getDownloadURL).toHaveBeenCalledWith(ref());
  });

  it('displays an error message when getDownloadURL rejects', async () => {
    // Suppress the component's console.error call during this test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    getDownloadURL.mockRejectedValue(new Error('Failed to fetch'));

    render(<FirebaseImage path="bad/path.jpg" />);

    // Should render the error message
    expect(await screen.findByText('Error loading image')).toBeInTheDocument();

    // Neither skeleton nor img should remain
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByText(/react-loading-skeleton/)).toBeNull();
  });

  it('does nothing if no path prop is provided', () => {
    render(<FirebaseImage />);

    // getDownloadURL should never be called
    expect(getDownloadURL).not.toHaveBeenCalled();

    // Skeleton still renders because imageLoaded=false and url=null
    expect(document.querySelector('.react-loading-skeleton')).toBeInTheDocument();
  });
});
