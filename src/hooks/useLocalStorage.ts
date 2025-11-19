import { useState, useEffect } from "react";

/**
 * useLocalStorage Hook
 * Đồng bộ state với localStorage
 *
 * @param key - localStorage key
 * @param initialValue - Giá trị khởi tạo
 * @returns [value, setValue, removeValue]
 *
 * @example
 * const [user, setUser, removeUser] = useLocalStorage("user", null);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // State để lưu giá trị
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Lấy giá trị từ localStorage
      const item = window.localStorage.getItem(key);
      // Parse JSON hoặc return initialValue nếu không có
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Hàm để set giá trị vào state và localStorage
  const setValue = (value: T) => {
    try {
      // Cho phép value là function để update dựa trên giá trị cũ
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Hàm để xóa giá trị
  const removeValue = () => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}
