import api from "../lib/api";

export interface ProductAttributeType {
  id: number;
  name: string;
  description?: string;
  dataType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'MULTI_SELECT';
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  validationRules?: string;
  options?: string[]; // For SELECT and MULTI_SELECT types
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributeTypeRequest {
  name: string;
  description?: string;
  dataType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'MULTI_SELECT';
  isRequired?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  validationRules?: string;
  options?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAttributeTypeRequest {
  name?: string;
  description?: string;
  dataType?: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'MULTI_SELECT';
  isRequired?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  validationRules?: string;
  options?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface AttributeTypeSearchParams {
  name?: string;
  dataType?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const productAttributeService = {
  // Get all product attribute types with pagination
  async getAll(params?: AttributeTypeSearchParams): Promise<ProductAttributeType[]> {
    try {
      console.log('Fetching product attribute types with params:', params);
      
      const queryParams = new URLSearchParams();
      if (params?.name) queryParams.append('name', params.name);
      if (params?.dataType) queryParams.append('dataType', params.dataType);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await api.get<ProductAttributeType[]>(`/api/v1/product-attribute-types?${queryParams}`);
      
      // Handle both direct array response and paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'content' in response.data) {
        return (response.data as PaginatedResponse<ProductAttributeType>).content;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching product attribute types:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product attribute types');
    }
  },

  // Get a product attribute type by ID
  async getById(id: number): Promise<ProductAttributeType> {
    try {
      console.log('Fetching product attribute type by ID:', id);
      const response = await api.get<ProductAttributeType>(`/api/v1/product-attribute-types/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product attribute type:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product attribute type');
    }
  },

  // Get a product attribute type by name
  async getByName(name: string): Promise<ProductAttributeType> {
    try {
      console.log('Fetching product attribute type by name:', name);
      const response = await api.get<ProductAttributeType>(`/api/v1/product-attribute-types/name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product attribute type by name:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product attribute type by name');
    }
  },

  // Search product attribute types by name
  async searchByName(name: string): Promise<ProductAttributeType[]> {
    try {
      console.log('Searching product attribute types by name:', name);
      const response = await api.get<ProductAttributeType[]>(`/api/v1/product-attribute-types/search?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching product attribute types:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to search product attribute types');
    }
  },

  // Create a new product attribute type
  async create(attributeType: CreateAttributeTypeRequest): Promise<ProductAttributeType> {
    try {
      console.log('Creating product attribute type:', attributeType);
      const response = await api.post<ProductAttributeType>('/api/v1/product-attribute-types', attributeType);
      return response.data;
    } catch (error: any) {
      console.error('Error creating product attribute type:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create product attribute type');
    }
  },

  // Update a product attribute type
  async update(id: number, attributeType: UpdateAttributeTypeRequest): Promise<ProductAttributeType> {
    try {
      console.log('Updating product attribute type:', id, attributeType);
      const response = await api.put<ProductAttributeType>(`/api/v1/product-attribute-types/${id}`, attributeType);
      return response.data;
    } catch (error: any) {
      console.error('Error updating product attribute type:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update product attribute type');
    }
  },

  // Delete a product attribute type
  async delete(id: number): Promise<void> {
    try {
      console.log('Deleting product attribute type:', id);
      await api.delete(`/api/v1/product-attribute-types/${id}`);
    } catch (error: any) {
      console.error('Error deleting product attribute type:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete product attribute type');
    }
  },

  // Check if a product attribute type is in use
  async isInUse(id: number): Promise<boolean> {
    try {
      console.log('Checking if product attribute type is in use:', id);
      const response = await api.get<{ inUse: boolean }>(`/api/v1/product-attribute-types/${id}/in-use`);
      return response.data.inUse;
    } catch (error: any) {
      console.error('Error checking if product attribute type is in use:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check if product attribute type is in use');
    }
  },

  // Get data type options
  getDataTypeOptions(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'TEXT', label: 'Text', description: 'Single line text input' },
      { value: 'NUMBER', label: 'Number', description: 'Numeric input' },
      { value: 'BOOLEAN', label: 'Boolean', description: 'True/False checkbox' },
      { value: 'DATE', label: 'Date', description: 'Date picker' },
      { value: 'SELECT', label: 'Select', description: 'Single choice dropdown' },
      { value: 'MULTI_SELECT', label: 'Multi-Select', description: 'Multiple choice dropdown' }
    ];
  }
};
