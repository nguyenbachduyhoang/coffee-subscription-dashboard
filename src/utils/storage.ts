// Enhanced localStorage utility with error handling and type safety
export class StorageService {
  private static instance: StorageService;
  private readonly prefix: string = 'coffee-admin-';

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // Set item with error handling and optional expiration
  setItem<T>(key: string, value: T, expirationHours?: number): boolean {
    try {
      const item = {
        value,
        timestamp: new Date().getTime(),
        expiresAt: expirationHours 
          ? new Date().getTime() + (expirationHours * 60 * 60 * 1000)
          : null
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
      return false;
    }
  }

  // Get item with expiration check
  getItem<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.getKey(key));
      if (!stored) return null;

      const item = JSON.parse(stored);
      
      // Check expiration
      if (item.expiresAt && new Date().getTime() > item.expiresAt) {
        this.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      console.error(`Error getting localStorage item ${key}:`, error);
      this.removeItem(key); // Clean up corrupted data
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
    }
  }

  // Clear all app-related items
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const storage = StorageService.getInstance();

// Auth-specific storage methods
export const authStorage = {
  setAuth: (authData: any) => storage.setItem('auth', authData, 24), // 24 hours
  getAuth: () => storage.getItem('auth'),
  removeAuth: () => storage.removeItem('auth'),
  isAuthenticated: () => !!storage.getItem('auth')
};
