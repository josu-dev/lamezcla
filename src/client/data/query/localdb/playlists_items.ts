import type * as Model from '$lib/models/youtube.js';
import type { ArrayPromise, VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';
import type { DexieWithTables } from './db.js';


export type LocalPlaylistItem = Model.PlaylistItemCompact;

export type Table = EntityTable<LocalPlaylistItem, 'id'>;

export const TABLE_NAME = 'playlists_items';

export const TABLE_INDEXES = 'id, playlist_id, video_id';

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function select_playlists_items_by_playlist(id: string): ArrayPromise<Model.PlaylistItemCompact> {
    const ou = await db.playlists_items.where('playlist_id').equals(id).toArray();

    return ou;
}

export async function upsert_playlists_items(value: Model.PlaylistItemCompact[]): VoidPromise {
    await db.playlists_items.bulkPut(value);
}

export async function delete_playlists_items_by_playlist(id: string): VoidPromise {
    await db.playlists_items.where('playlist_id').equals(id).delete();
}

export async function delete_playlists_items(ids: string[]): VoidPromise {
    await db.playlists_items.bulkDelete(ids);
}
