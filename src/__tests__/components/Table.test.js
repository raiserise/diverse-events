// npm test -- src/__tests__/components/Table.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../../components/Table';

describe('<Table />', () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Age', accessor: 'age' },
    { header: 'Tags', accessor: 'tags' },
  ];

  const data = [
    { id: 1, name: 'Alice', age: 25, tags: ['student', 'developer'] },
    { id: 2, name: 'Bob',   age: 30, tags: ['manager'] },
  ];

  it('renders table headers and all cell data', () => {
    render(<Table columns={columns} data={data} />);
    // headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();

    // row data
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    // array cell formatting
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getByText('developer')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
  });

  it('shows "No data available" when data is empty', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders Edit/Delete buttons and fires callbacks with correct id', () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <Table
        columns={columns}
        data={data}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    );

    // there are two rows: first Edit should be called with id 1
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(handleEdit).toHaveBeenCalledWith(1);

    // second Delete should be called with id 2
    fireEvent.click(screen.getAllByText('Delete')[1]);
    expect(handleDelete).toHaveBeenCalledWith(2);
  });

  it('renders an "Actions" header when edit/delete handlers are provided', () => {
    render(
      <Table
        columns={columns}
        data={data}
        handleEdit={() => {}}
        handleDelete={() => {}}
      />
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
