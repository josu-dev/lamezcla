import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncOptional, AsyncVoid } from '$lib/utils/index.js';
import { now_utc } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';


export type TableSchema = Model.LPlaylist;

export const TABLE_NAME = 'lplaylists';

export const TABLE_INDEXES = 'id, channel_id';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_lplaylist(value: Model.LPlaylist): AsyncVoid {
    value.updated_at = now_utc();
    await db.lplaylists.put(value);
}

export async function upsert_lplaylists(values: Model.LPlaylist[]): AsyncVoid {
    const now = now_utc();
    for (const value of values) {
        value.updated_at = now;
    }
    await db.lplaylists.bulkPut(values);
}

export async function select_lplaylist_by_id(id: string): AsyncOptional<Model.LPlaylist> {
    return await db.lplaylists.where('id').equals(id).first();
}

export async function select_lplaylists_by_channel_id(id: string): AsyncArray<Model.LPlaylist> {
    return await db.lplaylists.where('channel_id').equals(id).toArray();
}

export async function update_lplaylist_by_id(id: string, fn: (value: Model.LPlaylist) => void): AsyncVoid {
    await db.lplaylists.where('id').equals(id).modify(fn);
}

export async function delete_lplaylists(ids: string[]): AsyncVoid {
    await db.lplaylists.bulkDelete(ids);
}

export async function delete_lplaylist_by_id(id: string): AsyncVoid {
    await db.lplaylists.where('id').equals(id).and((x => x.deletable)).delete();
}
