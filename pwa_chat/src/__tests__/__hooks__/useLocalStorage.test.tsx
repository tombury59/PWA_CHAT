// TypeScript
// File: `src/__tests__/__hooks__/useLocalStorage.test.tsx`
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect } from 'vitest';
import { useLocalStorage } from '@/hooks/useLocalStorage';

function StringComponent({ storageKey, initial }: { storageKey: string; initial: string }) {
    const [value, setValue] = useLocalStorage<string>(storageKey, initial);
    return (
        <div>
            <span data-testid="value">{value}</span>
            <button data-testid="set-btn" onClick={() => setValue('updated')}>set</button>
        </div>
    );
}

function JsonComponent({ storageKey, initial }: { storageKey: string; initial: Record<string, any> }) {
    const [value, setValue] = useLocalStorage<Record<string, any>>(storageKey, initial);
    return (
        <div>
            <span data-testid="value">{JSON.stringify(value)}</span>
            <button
                data-testid="inc-btn"
                onClick={() => setValue(prev => ({ ...(prev as Record<string, any>), count: (prev as any).count + 1 }))}
            >
                inc
            </button>
        </div>
    );
}

describe('useLocalStorage hook', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('retourne la valeur initiale si rien dans localStorage', () => {
        render(<StringComponent storageKey="k1" initial="init" />);
        expect(screen.getByTestId('value').textContent).toBe('init');
    });

    it('charge une string brute depuis localStorage (pas du JSON)', () => {
        localStorage.setItem('k2', 'raw-string');
        render(<StringComponent storageKey="k2" initial="init" />);
        expect(screen.getByTestId('value').textContent).toBe('raw-string');
    });

    it('charge un objet JSON depuis localStorage', () => {
        localStorage.setItem('k3', JSON.stringify({ a: 1 }));
        render(<JsonComponent storageKey="k3" initial={{}} />);
        expect(screen.getByTestId('value').textContent).toBe(JSON.stringify({ a: 1 }));
    });

    it('setValue met à jour l\'état et écrit dans localStorage pour une string', () => {
        render(<StringComponent storageKey="k4" initial="init" />);
        const btn = screen.getByTestId('set-btn');
        fireEvent.click(btn);
        expect(screen.getByTestId('value').textContent).toBe('updated');
        expect(localStorage.getItem('k4')).toBe('updated');
    });

    it('setValue avec fonction met à jour l\'objet et écrit du JSON', () => {
        render(<JsonComponent storageKey="k5" initial={{ count: 0 }} />);
        const btn = screen.getByTestId('inc-btn');
        fireEvent.click(btn);
        expect(screen.getByTestId('value').textContent).toBe(JSON.stringify({ count: 1 }));
        expect(JSON.parse(localStorage.getItem('k5') as string)).toEqual({ count: 1 });
    });
});
