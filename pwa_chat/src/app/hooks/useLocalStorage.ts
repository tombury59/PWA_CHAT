import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
    // État avec une fonction d'initialisation qui ne s'exécute qu'une fois
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading localStorage key "%s":', key, error);
            return initialValue;
        }
    });

    // Persister dans localStorage quand la valeur change
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error('Error setting localStorage key "%s":', key, error);
        }
    }, [key, storedValue]);

    const setValue: SetValue<T> = value => {
        try {
            // Permettre à value d'être une fonction
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
        } catch (error) {
            console.error('Error setting value for localStorage key "%s":', key, error);
        }
    };

    return [storedValue, setValue];
}
