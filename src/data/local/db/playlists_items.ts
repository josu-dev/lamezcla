import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncVoid } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';


export type TableSchema = Model.PlaylistItemCompact;

export const TABLE_NAME = 'playlists_items';

export const TABLE_INDEXES = 'id, playlist_id, video_id';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_playlist_item(value: Model.PlaylistItemCompact): AsyncVoid {
    await db.playlists_items.put(value);
}

export async function upsert_playlists_items(values: Model.PlaylistItemCompact[]): AsyncVoid {
    await db.playlists_items.bulkPut(values);
}

export async function select_playlist_items_by_playlist_id(id: string): AsyncArray<Model.PlaylistItemCompact> {
    const out = await db.playlists_items.where('playlist_id').equals(id).toArray();
    return out;
}

export async function select_playlists_item_by_video_id(id: string): AsyncArray<Model.PlaylistItemCompact> {
    const out = await db.playlists_items.where('video_id').equals(id).toArray();
    return out;
}

export async function update_playlist_item_by_id(id: string, fn: (value: Model.PlaylistItemCompact) => void): AsyncVoid {
    await db.playlists_items.where('id').equals(id).modify(fn);
}

export async function delete_playlist_items_by_playlist_id(id: string): AsyncVoid {
    await db.playlists_items.where('playlist_id').equals(id).delete();
}

export async function delete_playlists_items(): AsyncVoid {
    await db.playlists_items.clear();
}

export async function delete_playlist_item_by_id(id: Model.StringId): AsyncVoid {
    await db.playlists_items.delete(id);
}

export async function delete_playlists_items_by_ids(ids: string[]): AsyncVoid {
    await db.playlists_items.bulkDelete(ids);
}

export async function delete_playlist_item_by_playlist_and_video_id(playlist_id: Model.StringId, video_id: Model.StringId) {
    await db.playlists_items.where({ playlist_id, video_id }).delete();
}
