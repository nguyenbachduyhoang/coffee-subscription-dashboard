import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../types/api';

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const execute = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = (err as ApiError).message || 'Đã xảy ra lỗi';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => execute(), [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute
  };
}

// Mutation hook for create/update/delete operations
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const mutate = useCallback(async (params: P) => {
    setLoading(true);
    setError('');
    try {
      const result = await mutationFn(params);
      return result;
    } catch (err) {
      const errorMessage = (err as ApiError).message || 'Đã xảy ra lỗi';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return {
    mutate,
    loading,
    error,
    reset: () => setError('')
  };
}

// Async state hook with loading management
export function useAsyncState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const setAsyncState = useCallback(async (
    newState: T | ((prevState: T) => T) | Promise<T> | (() => Promise<T>)
  ) => {
    setLoading(true);
    setError('');
    
    try {
      let resolvedState: T;
      
      if (typeof newState === 'function') {
        const fn = newState as any;
        if (fn.constructor.name === 'AsyncFunction' || typeof fn().then === 'function') {
          resolvedState = await fn();
        } else {
          resolvedState = fn(state);
        }
      } else if (newState && typeof newState.then === 'function') {
        resolvedState = await newState;
      } else {
        resolvedState = newState as T;
      }
      
      setState(resolvedState);
      return resolvedState;
    } catch (err) {
      const errorMessage = (err as ApiError).message || 'Đã xảy ra lỗi';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [state]);

  return {
    state,
    setState: setAsyncState,
    loading,
    error,
    reset: () => setError('')
  };
}
