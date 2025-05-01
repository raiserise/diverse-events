// npm test -- src/__tests__/components/EventsFilter.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventsFilter from '../../components/EventsFilter';

describe('EventsFilter', () => {
  const setup = (overrides = {}) => {
    const props = {
      searchQuery: overrides.searchQuery || '',
      onSearchChange: overrides.onSearchChange || jest.fn(),
      selectedFormat: overrides.selectedFormat || '',
      onFormatChange: overrides.onFormatChange || jest.fn(),
    };
    render(<EventsFilter {...props} />);
    return props;
  };

  it('renders input with provided searchQuery and fires onSearchChange on change', () => {
    const onSearchChange = jest.fn();
    setup({ searchQuery: 'test', onSearchChange });

    const input = screen.getByPlaceholderText('Search events...');
    expect(input).toHaveValue('test');

    fireEvent.change(input, { target: { value: 'hello' } });
    expect(onSearchChange).toHaveBeenCalledWith('hello');
  });

  it('renders select with provided selectedFormat and fires onFormatChange on change', () => {
    const onFormatChange = jest.fn();
    setup({ selectedFormat: 'Online', onFormatChange });

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Online');

    fireEvent.change(select, { target: { value: 'Physical' } });
    expect(onFormatChange).toHaveBeenCalledWith('Physical');
  });

  it('renders all format options', () => {
    setup();

    const options = screen.getAllByRole('option');
    const values = options.map((o) => o.value);
    expect(values).toEqual(['', 'Online', 'Physical', 'Hybrid']);
    expect(options.map(o => o.textContent)).toEqual([
      'All Formats',
      'Online',
      'Physical',
      'Hybrid',
    ]);
  });
});
