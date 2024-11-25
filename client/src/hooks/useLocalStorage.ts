import { useEffect, useState } from "react";

export const CART_KEY = "cart";

export function useLocalState(defaultValue: [], key: string) {
  const [localValue, setLocalValue] = useState(() => {
    const localStorageValue = localStorage.getItem(key);

    return localStorageValue !== null
      ? JSON.parse(localStorageValue)
      : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(localValue));
  }, [key, localValue]);

  return [localValue, setLocalValue];
}
