import { loadSession, saveSession } from '../src/core/session';

test('session persistence: save and load session history', async () => {
  const testSession = { history: ['hello', 'world'] };
  await saveSession(testSession);
  const loaded = await loadSession();
  if (JSON.stringify(loaded) !== JSON.stringify(testSession)) {
    throw new Error('Session data mismatch');
  }
});
