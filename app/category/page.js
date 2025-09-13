// app/categories/page.js
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/ui/sidebar";
import CategoryList from '@/components/CategoryList';
import CategoryForm from '@/components/CategoryForm';
import Loading from '@/components/ui/Loading';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/category');
            if (response.ok) {
                const data = await response.json();
                // Sort categories by created_at in descending order (newest first)
                const sortedCategories = data.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setCategories(sortedCategories);
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (error) {
            toast.error('Error fetching categories: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, newStatus) => {
        try {
            // First, get the current category to preserve other fields
            const currentCategory = categories.find(cat => cat.id === id);
            if (!currentCategory) {
                throw new Error('Category not found');
            }

            const response = await fetch(`/api/category/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: currentCategory.name,
                    fee: currentCategory.fee,
                    description: currentCategory.description,
                    is_active: newStatus
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            // Parse the updated category data
            const updatedCategory = await response.json();

            // Update the local state with the returned data
            setCategories(categories.map(cat =>
                cat.id === id ? updatedCategory : cat
            ));

            toast.success('Category status updated successfully!');
            
        } catch (error) {
            toast.error('Error updating category status: ' + error.message);
        }
    };

    const handleAddCategory = async (categoryData) => {
        try {
            const response = await fetch('/api/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to add category');
            }

            // Add new category at the beginning of the array
            setCategories([result, ...categories]);
            setShowForm(false);
            toast.success('Category added successfully!');
        } catch (error) {
            toast.error('Error adding category: ' + error.message);
        }
    };

    const handleUpdateCategory = async (updatedCategory) => {
        try {
            const response = await fetch(`/api/category/${updatedCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCategory),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update category');
            }

            setCategories(categories.map(cat =>
                cat.id === result.id ? result : cat
            ));

            toast.success('Category updated successfully!');
        } catch (error) {
            toast.error('Error updating category: ' + error.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const response = await fetch(`/api/category/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete category');
            }

            setCategories(categories.filter(cat => cat.id !== id));
            toast.success('Category deleted successfully!');
        } catch (error) {
            toast.error('Error deleting category: ' + error.message);
        }
    };

    if (loading) {
  return <Loading />;
}

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 p-8">
                {/* Toaster Component */}
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                
                <div className="w-full max-w-6xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="sm:flex-auto">
                            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                            <p className="mt-2 text-sm text-gray-700">
                                Efficiently organize and maintain your business categories.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-orange-400 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Category
                        </button>
                    </div>

                    {showForm ? (
                        <CategoryForm
                            onSubmit={handleAddCategory}
                            onCancel={() => setShowForm(false)}
                        />
                    ) : (
                        <CategoryList
                            categories={categories}
                            onEdit={handleUpdateCategory}
                            onDelete={handleDeleteCategory}
                            onToggleStatus={handleToggleStatus}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}