import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncOptional, AsyncVoid } from '$lib/utils/index.js';
import { now_utc } from '$lib/utils/index.js';
import type { DexieWithTables, } from './db.js';


export type TableSchema = Model.YPlaylist;

export const TABLE_NAME = 'yplaylists';

export const TABLE_INDEXES = 'id, channel_id';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_yplaylist(value: Model.YPlaylist): AsyncVoid {
    value.updated_at = now_utc();
    await db.yplaylists.put(value);
}

export async function upsert_yplaylists(values: Model.YPlaylist[]): AsyncVoid {
    const now = now_utc();
    for (const value of values) {
        value.updated_at = now;
    }
    await db.yplaylists.bulkPut(values);
}

export async function select_yplaylist_by_id(id: string): AsyncOptional<Model.YPlaylist> {
    return await db.yplaylists.where('id').equals(id).first();
}

export async function select_yplaylists_by_channel_id(id: string): AsyncArray<Model.YPlaylist> {
    return await db.yplaylists.where('channel_id').equals(id).toArray();
}

export async function update_yplaylist_by_id(id: string, fn: (value: Model.YPlaylist) => void): AsyncVoid {
    await db.yplaylists.where('id').equals(id).modify(fn);
}

export async function delete_yplaylist_by_id(id: string): AsyncVoid {
    await db.yplaylists.delete(id);
}

export async function delete_yplaylists_by_ids(ids: string[]): AsyncVoid {
    await db.yplaylists.bulkDelete(ids);
}
