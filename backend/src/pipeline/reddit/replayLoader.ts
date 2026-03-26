import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { RawRedditUnit } from '../../types/internal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ReplayFile {
  slug: string;
  displayName: string;
  units: RawRedditUnit[];
}

export async function loadReplayFixture(slug: string): Promise<ReplayFile | null> {
  try {
    const path = join(__dirname, '../../fixtures', `${slug}.replay.json`);
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as ReplayFile;
  } catch {
    return null;
  }
}
