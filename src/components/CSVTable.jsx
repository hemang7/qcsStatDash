import React from "react";
import { useTable } from "react-table";

function CSVTable({ data }) {
  const columns = React.useMemo(
    () => data[0].map((col) => ({ Header: col, accessor: col })),
    [data]
  );

  const rows = React.useMemo(() => data.slice(1), [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows: row,
    prepareRow,
  } = useTable({
    columns,
    data: rows,
  });

  return (
    <table {...getTableProps()} className="table-auto">
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {row.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default CSVTable;
