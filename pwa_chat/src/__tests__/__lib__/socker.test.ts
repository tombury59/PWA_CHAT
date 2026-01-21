// File: `src/__tests__/socket.test.ts`
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocker `socket.io-client` avant l'import du module testé
vi.mock('socket.io-client', () => {
    return {
        io: vi.fn(() => ({ mocked: true })),
    };
});

describe('src/__lib__/socket', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('appelle io avec la bonne URL et options et exporte l\'instance mockée', async () => {
        // importer le module après avoir défini le mock
        const mod = await import('../../lib/socket');
        const socket = mod.default;

        // importer la version mockée de socket.io-client pour assertions
        const socketio = await import('socket.io-client');

        expect(socketio.io).toHaveBeenCalledTimes(1);
        expect(socketio.io).toHaveBeenCalledWith('https://api.tools.gavago.fr/socketio', {
            transports: ['websocket'],
            autoConnect: false,
        });

        expect(socket).toEqual({ mocked: true });
    });
});
