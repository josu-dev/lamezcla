import type { DexieWithTables } from '$lib/client/db/db.js';
import type * as Model from '$lib/models/youtube.js';
import type { VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';

export type LocalPlaylistItem = {
    id: string,
    playlist_id: string;
    video_id: string;
    position: number;
    privacy_status: string;
    published_at: string;
};

export type Table = EntityTable<LocalPlaylistItem, 'id'>;

export const TABLE_NAME = 'playlists_items';

export const TABLE_INDEXES = 'id, playlist_id, video_id';

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function insert_playlists_items(value: Model.PlaylistItem[]): VoidPromise {
    await db.playlists_items.bulkAdd(value).catch('BulkError', (error) => {
        console.info(error);
    });
}
