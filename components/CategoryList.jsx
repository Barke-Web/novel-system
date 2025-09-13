// components/CategoryList.js
'use client';

import { useState } from 'react';
import CategoryForm from './CategoryForm';
import { DeleteIcon, Edit2Icon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';

export default function CategoryList({ categories, onEdit, onDelete, onToggleStatus }) {
  const [editingCategory, setEditingCategory] = useState(null);

  const handleEdit = (category) => {
    setEditingCategory(category);
  };

  const handleUpdate = (updatedCategory) => {
    onEdit(updatedCategory);
    setEditingCategory(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      onDelete(id);
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    onToggleStatus(id, !currentStatus);
  };

  if (editingCategory) {
    return (
      <CategoryForm 
        category={editingCategory}
        onSubmit={handleUpdate}
        onCancel={() => setEditingCategory(null)}
      />
    );
  }

  if (categories?.length === 0) {
    return (
      <div className="mt-8 bg-white shadow rounded-lg p-7 text-center">
        <p className="text-gray-500">No categories found.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Fee
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories?.map((category) => (
                  <tr key={category.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {category.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${category.fee}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {category.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleToggleStatus(category.id, category.is_active)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          category.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {category.is_active ? (
                          <>
                            <ToggleRightIcon className="w-4 h-4 mr-1 text-green-500" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeftIcon className="w-4 h-4 mr-1 text-gray-500" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={() => handleEdit(category)}
                          className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          type="button"
                        >
                          <Edit2Icon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                          type="button"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}