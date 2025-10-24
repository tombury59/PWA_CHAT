// TypeScript
// Fichier : pwa_chat/src/hooks/useLocalStorage.ts
import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [state, setState] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return initialValue;
            try {
                return JSON.parse(item) as T;
            } catch {
                // si ce n'est pas du JSON, retourner la string brute
                return item as unknown as T;
            }
        } catch {
            return initialValue;
        }
    });

    const setValue = (value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(state) : value;
            if (typeof valueToStore === "string") {
                // stocker la string brute (pas de guillemets supplémentaires)
                localStorage.setItem(key, valueToStore);
            } else {
                localStorage.setItem(key, JSON.stringify(valueToStore));
            }
            setState(valueToStore);
        } catch {
            // ignore erreurs
        }
    };

    return [state, setValue] as const;
}
