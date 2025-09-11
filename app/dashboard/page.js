"use client";
import * as React from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Sidebar } from "@/components/ui/sidebar";
/**
 * @typedef {Object} Person
 * @property {string} name
 * @property {number} age
 * @property {string} status
 */

// Sample dataset
const data = [
    { name: "Alice", age: 25, status: "Active" },
    { name: "Bob", age: 30, status: "Inactive" },
    { name: "Charlie", age: 35, status: "Pending" },
    { name: "Diana", age: 28, status: "Active" },
    { name: "Ethan", age: 42, status: "Active" },
    { name: "Fiona", age: 31, status: "Inactive" },
    { name: "George", age: 29, status: "Pending" },
    { name: "Hannah", age: 27, status: "Active" },
];

// Create a column helper to ensure type safety
const columnHelper = createColumnHelper();

// Define columns for the table
const columns = [
    columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("age", {
        header: "Age",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
            const status = info.getValue();
            let statusColor;
            switch (status) {
                case "Active":
                    statusColor = "bg-green-100 text-green-800";
                    break;
                case "Inactive":
                    statusColor = "bg-red-100 text-red-800";
                    break;
                case "Pending":
                    statusColor = "bg-yellow-100 text-yellow-800";
                    break;
                default:
                    statusColor = "bg-gray-100 text-gray-800";
            }
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {status}
                </span>
            );
        },
    }),
];

export default function App() {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // ...existing code...
return (
  <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <Sidebar />
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full p-0">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-2">Manage your users with this interactive table</p>
          </div>

          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-gray-50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{table.getRowModel().rows.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-5 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  Previous
                </button>
                <button className="px-5 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Built with React Table and Tailwind CSS</p>
        </div>
      </div>
    </div>
  </div>
    );
}