import type { DexieWithTables, } from '$lib/client/db/db.js';
import type * as Model from '$lib/models/youtube.js';
import type { ArrayPromise, OptionalPromise, VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';

export type LocalPlaylist = {
    id: string,
    channel_id: string;
    description: string;
    img: undefined | Model.Image;
    item_count: number;
    privacy_status: string;
    published_at: string;
    updated_at: string;
    title: string;
};

export type Table = EntityTable<LocalPlaylist, 'id'>;

export const TABLE_NAME = 'playlists';
export const TABLE_INDEXES = 'id, channel_id';
// playlists: 'id, channel_id, published_at, updated_at, title, description, img, item_count, privacy_status',

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function select_playlist(id: string): OptionalPromise<Model.Playlist> {
    return await db.playlists.where('id').equals(id).first();
}

export async function select_playlists_by_channel_id(channel_id: string): ArrayPromise<Model.Playlist> {
    return await db.playlists.where('channel_id').equals(channel_id).toArray();
}

export async function insert_playlist(playlist: Model.Playlist): VoidPromise {
    await db.playlists.put(playlist);
}

export async function insert_playlists(playlists: Model.Playlist[]): VoidPromise {
    await db.playlists.bulkPut(playlists);
}

export async function delete_playlists(id: string): VoidPromise {
    await db.playlists.delete(id);
}
