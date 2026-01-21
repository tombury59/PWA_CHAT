import { describe, it, expect, beforeEach } from 'vitest';
import {
    saveMessageToSend,
    getMessagesToSend,
    clearSentMessages,
    saveReceivedMessages,
    getCachedMessages,
} from '@/lib/offline-sync';

describe('offline-sync', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saveMessageToSend ajoute et getMessagesToSend récupère les messages', async () => {
        await saveMessageToSend({ id: 1, text: 'hello' });
        let msgs = await getMessagesToSend();
        expect(msgs).toEqual([{ id: 1, text: 'hello' }]);

        await saveMessageToSend({ id: 2, text: 'world' });
        msgs = await getMessagesToSend();
        expect(msgs).toHaveLength(2);
        expect(msgs[1]).toMatchObject({ id: 2, text: 'world' });
    });

    it('clearSentMessages vide l\'outbox', async () => {
        await saveMessageToSend({ foo: 'bar' });
        expect((await getMessagesToSend()).length).toBeGreaterThan(0);

        await clearSentMessages();
        const msgs = await getMessagesToSend();
        expect(msgs).toEqual([]);
        expect(localStorage.getItem('pwa-chat-outbox')).toBeNull();
    });

    it('saveReceivedMessages stocke et getCachedMessages récupère par roomId', async () => {
        const roomId = 'room1';
        await saveReceivedMessages(roomId, [{ id: 'm1', text: 'msg' }]);
        const cached = await getCachedMessages(roomId);
        expect(cached).toEqual([{ id: 'm1', text: 'msg' }]);

        // Une autre room doit être vide par défaut
        const other = await getCachedMessages('room-unknown');
        expect(other).toEqual([]);
    });

    //it('gère JSON invalide dans le storage sans planter (outbox)', async () => {
    //    localStorage.setItem('pwa-chat-outbox', 'not-json');
    //    const msgs = await getMessagesToSend();
    //    expect(msgs).toEqual([]);
    //});
});
