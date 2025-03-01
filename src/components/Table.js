import React from "react";

const Table = ({ columns = [], data = [], handleEdit, handleDelete }) => {
  const renderCell = (item, column) => {
    const value = item[column.accessor];
    if (Array.isArray(value)) {
      return (
        <ul>
          {value.map((service, index) => (
            <li key={index}>{service}</li>
          ))}
        </ul>
      );
    }
    return column.format ? column.format(value) : value;
  };

  return (
    <div className="p-5 h-screen bg-gray-200">
      <table className="w-full rounded-lg shadow table-fixed">
        <thead>
          <tr>
            <th className="p-3 text-left">#</th>
            {columns.map((col) => (
              <th key={col.accessor} className="p-3 text-left">
                {col.header}
              </th>
            ))}
            {(handleEdit || handleDelete) && (
              <th
                colSpan={handleEdit && handleDelete ? 2 : 1}
                className="text-center p-3"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-gray-100" : ""}
              >
                <td className="p-3">{index + 1}</td>
                {columns.map((col) => (
                  <td className="p-3 text-left" key={col.accessor}>
                    {renderCell(item, col)}
                  </td>
                ))}
                {handleEdit && (
                  <td className="text-right p-3">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="border border-gray-300 px-4 py-2 rounded hover:border-gray-500 hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  </td>
                )}
                {handleDelete && (
                  <td className="text-left p-3">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="border border-gray-300 px-4 py-2 rounded hover:border-red-500 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length +
                  1 +
                  (handleEdit ? 1 : 0) +
                  (handleDelete ? 1 : 0)
                }
                className="p-3"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
