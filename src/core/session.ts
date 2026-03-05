// Simple session persistence for voice interactions
import { join } from 'path';
import { homedir } from 'os';
import { readFile, writeFile } from 'fs/promises';

export interface Session {
  history: string[];
}

const SESSION_PATH = join(homedir(), '.voice-opencode-session.json');

export async function loadSession(): Promise<Session> {
  try {
    const data = await readFile(SESSION_PATH, 'utf8');
    return JSON.parse(data) as Session;
  } catch {
    return { history: [] };
  }
}

export async function saveSession(session: Session): Promise<void> {
  await writeFile(SESSION_PATH, JSON.stringify(session, null, 2), 'utf8');
}
