"use client";

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { 
  productAttributeService, 
  ProductAttributeType, 
  CreateAttributeTypeRequest,
  UpdateAttributeTypeRequest 
} from '../../../services/productAttributeService';

export default function ProductAttributesPage() {
  const [attributes, setAttributes] = useState<ProductAttributeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttributeType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDataType, setFilterDataType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [formData, setFormData] = useState<CreateAttributeTypeRequest>({
    name: '',
    description: '',
    dataType: 'TEXT',
    isRequired: false,
    isSearchable: false,
    isFilterable: false,
    validationRules: '',
    options: [],
    sortOrder: 0,
    isActive: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchAttributes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching product attribute types...');
      
      const attributesData = await productAttributeService.getAll({
        name: searchTerm || undefined,
        dataType: filterDataType || undefined,
        isActive: filterActive ? filterActive === 'true' : undefined,
        size: 100
      });
      
      console.log('Product attribute types fetched:', attributesData);
      setAttributes(attributesData);
    } catch (err: any) {
      console.error('Error fetching product attribute types:', err);
      setError(err.message || 'Failed to load product attribute types. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterDataType, filterActive]);

  // Fetch attributes from API on component mount
  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || filterDataType || filterActive) {
        fetchAttributes();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterDataType, filterActive, fetchAttributes]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.dataType) {
      errors.dataType = 'Data type is required';
    }

    if ((formData.dataType === 'SELECT' || formData.dataType === 'MULTI_SELECT') && 
        (!formData.options || formData.options.length === 0)) {
      errors.options = 'Options are required for SELECT and MULTI_SELECT types';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAttribute = async () => {
    if (!validateForm()) return;

    try {
      console.log('Creating new product attribute type:', formData);
      const createdAttribute = await productAttributeService.create(formData);
      console.log('Product attribute type created:', createdAttribute);
      
      setAttributes(prev => [...prev, createdAttribute]);
      resetForm();
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Error creating product attribute type:', err);
      setError(err.message || 'Failed to create product attribute type. Please try again.');
    }
  };

  const handleEditAttribute = (attribute: ProductAttributeType) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      description: attribute.description || '',
      dataType: attribute.dataType,
      isRequired: attribute.isRequired,
      isSearchable: attribute.isSearchable,
      isFilterable: attribute.isFilterable,
      validationRules: attribute.validationRules || '',
      options: attribute.options || [],
      sortOrder: attribute.sortOrder || 0,
      isActive: attribute.isActive
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateAttribute = async () => {
    if (!validateForm() || !editingAttribute) return;

    try {
      const updateData: UpdateAttributeTypeRequest = {
        name: formData.name,
        description: formData.description,
        dataType: formData.dataType,
        isRequired: formData.isRequired,
        isSearchable: formData.isSearchable,
        isFilterable: formData.isFilterable,
        validationRules: formData.validationRules,
        options: formData.options,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive
      };

      console.log('Updating product attribute type:', editingAttribute.id, updateData);
      const updatedAttribute = await productAttributeService.update(editingAttribute.id, updateData);
      console.log('Product attribute type updated:', updatedAttribute);
      
      setAttributes(prev => prev.map(attr => 
        attr.id === editingAttribute.id ? updatedAttribute : attr
      ));
      
      resetForm();
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Error updating product attribute type:', err);
      setError(err.message || 'Failed to update product attribute type. Please try again.');
    }
  };

  const handleDeleteAttribute = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product attribute type? This action cannot be undone.')) {
      return;
    }

    try {
      // Check if attribute is in use
      const inUse = await productAttributeService.isInUse(id);
      if (inUse) {
        alert('Cannot delete this attribute type because it is currently in use by products.');
        return;
      }

      console.log('Deleting product attribute type:', id);
      await productAttributeService.delete(id);
      console.log('Product attribute type deleted successfully');
      
      setAttributes(prev => prev.filter(attr => attr.id !== id));
    } catch (err: any) {
      console.error('Error deleting product attribute type:', err);
      setError(err.message || 'Failed to delete product attribute type. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dataType: 'TEXT',
      isRequired: false,
      isSearchable: false,
      isFilterable: false,
      validationRules: '',
      options: [],
      sortOrder: 0,
      isActive: true
    });
    setFormErrors({});
    setEditingAttribute(null);
    setIsAddModalOpen(false);
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((option, i) => i === index ? value : option) || []
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'TEXT': return '📝';
      case 'NUMBER': return '🔢';
      case 'BOOLEAN': return '☑️';
      case 'DATE': return '📅';
      case 'SELECT': return '📋';
      case 'MULTI_SELECT': return '📋';
      default: return '📝';
    }
  };

  const getDataTypeLabel = (dataType: string) => {
    const options = productAttributeService.getDataTypeOptions();
    return options.find(opt => opt.value === dataType)?.label || dataType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-neutral-200">
            Product Attribute Types
          </h1>
          <p className="text-light-text-secondary dark:text-neutral-400 mt-1">
            Manage product attribute types and their configurations
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          Add Attribute Type
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

      {/* Search and Filters */}
      <div className="bg-light-surface-elevated dark:bg-neutral-800 p-4 rounded-lg shadow-light-soft border border-light-border-subtle dark:border-neutral-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search attribute types by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <select
              value={filterDataType}
              onChange={(e) => setFilterDataType(e.target.value)}
              className="px-3 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
            >
              <option value="">All Data Types</option>
              {productAttributeService.getDataTypeOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-neutral-600 transition-colors flex items-center gap-2"
            >
              <FiFilter className="h-4 w-4" />
              Filters
            </button>

            <button
              onClick={fetchAttributes}
              className="px-3 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-neutral-600 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-light-text-secondary dark:text-neutral-400">Loading product attribute types...</p>
          </div>
        </div>
      )}

      {/* Attributes Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attributes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-light-text-primary dark:text-neutral-200 mb-2">
                No Attribute Types Found
              </h3>
              <p className="text-light-text-secondary dark:text-neutral-400 mb-4">
                Get started by creating your first product attribute type
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
              >
                <FiPlus className="h-4 w-4" />
                Add Your First Attribute Type
              </button>
            </div>
          ) : (
            attributes.map((attribute) => (
              <div key={attribute.id} className="bg-light-surface-elevated dark:bg-neutral-800 p-6 rounded-xl shadow-light-soft border border-light-border-subtle dark:border-neutral-700 hover:shadow-light-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getDataTypeIcon(attribute.dataType)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAttribute(attribute)}
                      className="text-warning hover:text-warning-600 p-1 rounded hover:bg-warning/10 transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAttribute(attribute.id)}
                      className="text-error hover:text-error-600 p-1 rounded hover:bg-error/10 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-neutral-200 mb-2">
                  {attribute.name}
                </h3>
                <p className="text-light-text-secondary dark:text-neutral-400 text-sm mb-4">
                  {attribute.description || 'No description'}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-text-tertiary dark:text-neutral-400">Type:</span>
                    <span className="font-medium">{getDataTypeLabel(attribute.dataType)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-text-tertiary dark:text-neutral-400">ID:</span>
                    <span className="font-medium">{attribute.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {attribute.isRequired && (
                    <span className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded text-xs">
                      Required
                    </span>
                  )}
                  {attribute.isSearchable && (
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded text-xs">
                      Searchable
                    </span>
                  )}
                  {attribute.isFilterable && (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded text-xs">
                      Filterable
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${
                    attribute.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {attribute.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {attribute.options && attribute.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-light-border-subtle dark:border-neutral-600">
                    <p className="text-xs text-light-text-muted dark:text-neutral-400 mb-2">Options:</p>
                    <div className="flex flex-wrap gap-1">
                      {attribute.options.slice(0, 3).map((option, index) => (
                        <span key={index} className="bg-light-bg-tertiary dark:bg-neutral-700 text-light-text-secondary dark:text-neutral-300 px-2 py-1 rounded text-xs">
                          {option}
                        </span>
                      ))}
                      {attribute.options.length > 3 && (
                        <span className="bg-light-bg-tertiary dark:bg-neutral-700 text-light-text-secondary dark:text-neutral-300 px-2 py-1 rounded text-xs">
                          +{attribute.options.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Attribute Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-light-surface-elevated dark:bg-neutral-800 rounded-xl shadow-light-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-light-border-subtle dark:border-neutral-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-neutral-200 mb-6">
                {editingAttribute ? 'Edit Attribute Type' : 'Add New Attribute Type'}
              </h2>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-neutral-200 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                        formErrors.name ? 'border-red-500' : 'border-light-border-subtle dark:border-neutral-600'
                      } bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200`}
                      placeholder="Enter attribute name"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-neutral-200 mb-2">
                      Data Type *
                    </label>
                    <select
                      value={formData.dataType}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataType: e.target.value as any }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                        formErrors.dataType ? 'border-red-500' : 'border-light-border-subtle dark:border-neutral-600'
                      } bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200`}
                    >
                      {productAttributeService.getDataTypeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                    {formErrors.dataType && <p className="text-red-500 text-xs mt-1">{formErrors.dataType}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-neutral-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
                    placeholder="Enter attribute description"
                  />
                </div>

                {/* Options for SELECT and MULTI_SELECT */}
                {(formData.dataType === 'SELECT' || formData.dataType === 'MULTI_SELECT') && (
                  <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-neutral-200 mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {formData.options?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="w-full px-4 py-2 border-2 border-dashed border-light-border-subtle dark:border-neutral-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-light-text-secondary dark:text-neutral-400"
                      >
                        <FiPlus className="h-4 w-4 inline mr-2" />
                        Add Option
                      </button>
                    </div>
                    {formErrors.options && <p className="text-red-500 text-xs mt-1">{formErrors.options}</p>}
                  </div>
                )}

                {/* Validation Rules */}
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-neutral-200 mb-2">
                    Validation Rules
                  </label>
                  <input
                    type="text"
                    value={formData.validationRules}
                    onChange={(e) => setFormData(prev => ({ ...prev, validationRules: e.target.value }))}
                    className="w-full px-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
                    placeholder="e.g., min:1,max:100,pattern:^[A-Za-z]+$"
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-neutral-200 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-light-border-subtle dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-light-surface dark:bg-neutral-700 text-light-text-primary dark:text-neutral-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="w-4 h-4 text-primary border-light-border-subtle dark:border-neutral-600 rounded focus:ring-primary bg-light-surface dark:bg-neutral-700"
                    />
                    <span className="text-sm font-medium text-light-text-primary dark:text-neutral-200">Required Field</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isSearchable}
                      onChange={(e) => setFormData(prev => ({ ...prev, isSearchable: e.target.checked }))}
                      className="w-4 h-4 text-primary border-light-border-subtle dark:border-neutral-600 rounded focus:ring-primary bg-light-surface dark:bg-neutral-700"
                    />
                    <span className="text-sm font-medium text-light-text-primary dark:text-neutral-200">Searchable</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isFilterable}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFilterable: e.target.checked }))}
                      className="w-4 h-4 text-primary border-light-border-subtle dark:border-neutral-600 rounded focus:ring-primary bg-light-surface dark:bg-neutral-700"
                    />
                    <span className="text-sm font-medium text-light-text-primary dark:text-neutral-200">Filterable</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary border-light-border-subtle dark:border-neutral-600 rounded focus:ring-primary bg-light-surface dark:bg-neutral-700"
                    />
                    <span className="text-sm font-medium text-light-text-primary dark:text-neutral-200">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-light-border-subtle dark:border-neutral-600 text-light-text-primary dark:text-neutral-200 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAttribute ? handleUpdateAttribute : handleAddAttribute}
                  className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingAttribute ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
