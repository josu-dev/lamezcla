import type { Transaction } from 'dexie';
import { seed_channels } from './channels.js';
import type { DexieWithTables } from './db.js';
import { seed_playlists } from './playlists.js';


export async function seed_defaults(tx: Transaction) {
    const db = tx.db as DexieWithTables;

    await seed_channels(db);
    await seed_playlists(db);
}
