"use client";

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { categoryService, CategoryDTO } from '../../../services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📱',
    featured: false,
    subcategories: ''
  });

  const icons = ['📱', '👕', '🏠', '⚽', '💄', '🖥️', '📚', '🎮', '🚗', '🍽️'];

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching categories from API...');
        
        const categoriesData = await categoryService.getAll();
        console.log('Categories fetched:', categoriesData);
        
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (formData.name.trim()) {
      try {
        const newCategoryData = {
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          isFeatured: formData.featured,
          isActive: true,
          sortOrder: categories.length + 1
        };
        
        console.log('Creating new category:', newCategoryData);
        const createdCategory = await categoryService.create(newCategoryData);
        console.log('Category created:', createdCategory);
        
        setCategories(prev => [...prev, createdCategory]);
        setIsAddModalOpen(false);
        setFormData({ name: '', description: '', icon: '📱', featured: false, subcategories: '' });
      } catch (err) {
        console.error('Error creating category:', err);
        setError('Failed to create category. Please try again.');
      }
    }
  };

  const handleEditCategory = (category: CategoryDTO) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: '📂', // Default icon since API doesn't store icons
      featured: category.isFeatured || false,
      subcategories: '' // Not supported in current API structure
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && formData.name.trim()) {
      try {
        const updateData = {
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          isFeatured: formData.featured,
          isActive: true
        };
        
        console.log('Updating category:', editingCategory.id, updateData);
        const updatedCategory = await categoryService.update(editingCategory.id, updateData);
        console.log('Category updated:', updatedCategory);
        
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        
        setIsAddModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', icon: '📱', featured: false, subcategories: '' });
      } catch (err) {
        console.error('Error updating category:', err);
        setError('Failed to update category. Please try again.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        console.log('Deleting category:', categoryId);
        await categoryService.remove(categoryId);
        console.log('Category deleted successfully');
        
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '📱', featured: false, subcategories: '' });
    setEditingCategory(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-neutral-200">Categories</h1>
          <p className="text-light-text-secondary dark:text-neutral-400 mt-1">Organize your products into categories</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-light-text-secondary dark:text-neutral-400">Loading categories...</p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-light-text-primary dark:text-neutral-200 mb-2">
                No Categories Found
              </h3>
              <p className="text-light-text-secondary dark:text-neutral-400 mb-4">
                Get started by creating your first category
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
              >
                <FiPlus className="h-4 w-4" />
                Add Your First Category
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-light-surface-elevated dark:bg-neutral-800 p-6 rounded-xl shadow-light-soft border border-light-border-subtle dark:border-neutral-700 hover:shadow-light-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">📂</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-warning hover:text-warning-600 p-1 rounded hover:bg-warning/10 transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-error hover:text-error-600 p-1 rounded hover:bg-error/10 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-neutral-200 mb-2">{category.name}</h3>
                <p className="text-light-text-secondary dark:text-neutral-400 text-sm mb-4">{category.description || 'No description'}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-light-text-tertiary dark:text-neutral-400">
                    ID: {category.id}
                  </span>
                  {category.isFeatured && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-light-border-subtle dark:border-neutral-600">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-light-bg-tertiary dark:bg-neutral-700 text-light-text-secondary dark:text-neutral-300 px-2 py-1 rounded">
                      Slug: {category.slug}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      category.isActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-light-surface-elevated dark:bg-neutral-800 rounded-xl shadow-light-lg w-full max-w-md border border-light-border-subtle dark:border-neutral-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-neutral-200 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                          formData.icon === icon
                            ? 'border-primary bg-primary/10'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subcategories
                  </label>
                  <input
                    type="text"
                    value={formData.subcategories}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategories: e.target.value }))}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Subcategory1, Subcategory2, Subcategory3"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Separate with commas</p>
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-neutral-700">Featured Category</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
