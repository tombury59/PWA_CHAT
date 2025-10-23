export const isBrowser = typeof window !== 'undefined';

export const getLocalStorage = (key: string) => {
    if (!isBrowser) return null;
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        return null;
    }
};

export const setLocalStorage = (key: string, value: string) => {
    if (!isBrowser) return;
    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        console.error(e);
    }
};
