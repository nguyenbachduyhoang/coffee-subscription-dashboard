import { useState, useCallback } from 'react';

// Validation utilities for forms
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Generic validation function
export function validateForm(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const rule = schema[field];
    const value = data[field];
    const error = validateField(value, rule, field);
    
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
}

// Validate single field
export function validateField(value: any, rule: ValidationRule, fieldName: string): string | null {
  // Required validation
  if (rule.required && (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === ''))) {
    return `${fieldName} là bắt buộc`;
  }

  // Skip other validations if value is empty and not required
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  const stringValue = String(value).trim();

  // Min length validation
  if (rule.minLength && stringValue.length < rule.minLength) {
    return `${fieldName} phải có ít nhất ${rule.minLength} ký tự`;
  }

  // Max length validation
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `${fieldName} không được vượt quá ${rule.maxLength} ký tự`;
  }

  // Min value validation (for numbers)
  if (rule.min !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < rule.min) {
      return `${fieldName} phải lớn hơn hoặc bằng ${rule.min}`;
    }
  }

  // Max value validation (for numbers)
  if (rule.max !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > rule.max) {
      return `${fieldName} phải nhỏ hơn hoặc bằng ${rule.max}`;
    }
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return `${fieldName} có định dạng không hợp lệ`;
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

// Product validation schema
export const productValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: (value) => {
      if (value && /^\s+|\s+$/.test(value)) {
        return 'Tên sản phẩm không được bắt đầu hoặc kết thúc bằng khoảng trắng';
      }
      return null;
    }
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  price: {
    required: true,
    min: 1000,
    max: 10000000,
    custom: (value) => {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Giá phải là một số hợp lệ';
      }
      if (numValue % 1000 !== 0) {
        return 'Giá phải là bội số của 1,000 VNĐ';
      }
      return null;
    }
  },
  category_id: {
    required: true,
    custom: (value) => {
      if (!value || value === '') {
        return 'Vui lòng chọn danh mục';
      }
      return null;
    }
  }
};

// Plan/Subscription validation schema
export const planValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    custom: (value) => {
      if (value && /^\s+|\s+$/.test(value)) {
        return 'Tên gói không được bắt đầu hoặc kết thúc bằng khoảng trắng';
      }
      return null;
    }
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 200
  },
  price: {
    required: true,
    min: 50000,
    max: 5000000,
    custom: (value) => {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Giá phải là một số hợp lệ';
      }
      if (numValue % 5000 !== 0) {
        return 'Giá phải là bội số của 5,000 VNĐ';
      }
      return null;
    }
  },
  durationDays: {
    required: true,
    min: 1,
    max: 365,
    custom: (value) => {
      const numValue = Number(value);
      if (isNaN(numValue) || !Number.isInteger(numValue)) {
        return 'Thời hạn phải là số nguyên';
      }
      return null;
    }
  },
  dailyQuota: {
    required: true,
    min: 1,
    max: 10,
    custom: (value) => {
      const numValue = Number(value);
      if (isNaN(numValue) || !Number.isInteger(numValue)) {
        return 'Hạn mức hàng ngày phải là số nguyên';
      }
      return null;
    }
  },
  maxPerVisit: {
    required: true,
    min: 1,
    max: 5,
    custom: (value) => {
      const numValue = Number(value);
      if (isNaN(numValue) || !Number.isInteger(numValue)) {
        return 'Tối đa mỗi lần phải là số nguyên';
      }
      return null;
    }
  },
  productId: {
    required: true,
    custom: (value) => {
      if (!value || value === '' || value === 0) {
        return 'Vui lòng chọn sản phẩm';
      }
      return null;
    }
  }
};

// Helper function to format price input
export function formatPrice(value: string): string {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');
  
  // Add thousands separators
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Helper function to parse formatted price
export function parsePrice(formattedPrice: string): number {
  return parseInt(formattedPrice.replace(/,/g, '')) || 0;
}

// Validation for image files
export function validateImageFile(file: File | null, required: boolean = false): string | null {
  if (!file) {
    return required ? 'Vui lòng chọn ảnh' : null;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP)';
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'Kích thước ảnh không được vượt quá 5MB';
  }

  return null;
}

// Real-time validation hook for forms
export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateFieldRealtime = useCallback((fieldName: string, value: any) => {
    const rule = schema[fieldName];
    if (!rule) return;

    const error = validateField(value, rule, fieldName);
    setErrors((prev: Record<string, string>) => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [schema]);

  const validateAllFields = useCallback((data: Record<string, any>) => {
    const result = validateForm(data, schema);
    setErrors(result.errors);
    return result;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev: Record<string, string>) => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  return {
    errors,
    validateFieldRealtime,
    validateAllFields,
    clearErrors,
    clearFieldError,
    hasErrors: Object.values(errors).some(error => error !== '')
  };
}

// Helper function to get error message for a field
export function getFieldError(errors: Record<string, string>, fieldName: string): string {
  return errors[fieldName] || '';
}

// Helper function to check if field has error
export function hasFieldError(errors: Record<string, string>, fieldName: string): boolean {
  return !!errors[fieldName];
}
