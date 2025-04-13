import { map_local_video_to_video, unavailable_video } from '$client/data/query/localdb/shared.js';
import type * as Model from '$lib/models/youtube.js';
import type { ArrayPromise, OptionalPromise, VoidPromise } from '$lib/utils/index.js';
import { now_utc, } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';
import type { DexieWithTables, } from './db.js';


export type LocalPlaylist = Model.Playlist;

export type Table = EntityTable<LocalPlaylist, 'id'>;

export const TABLE_NAME = 'playlists';

export const TABLE_INDEXES = 'id, channel_id';

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

export async function upsert_playlist(playlist: Model.Playlist): VoidPromise {
    const value: LocalPlaylist = { ...playlist, updated_at: now_utc() };
    await db.playlists.put(value);
}

export async function upsert_playlists(playlists: Model.Playlist[]): VoidPromise {
    const values: LocalPlaylist[] = [];
    for (const p of playlists) {
        values.push({
            ...p,
            updated_at: now_utc()
        });
    }
    await db.playlists.bulkPut(values);
}

export async function delete_playlist(id: string): VoidPromise {
    await db.playlists.delete(id);
}

export async function delete_playlists(ids: string[]): VoidPromise {
    await db.playlists.bulkDelete(ids);
}

export async function select_playlist_entries(id: string): Promise<Model.PlaylistEntry[]> {
    const items = await db.playlists_items.where('playlist_id').equals(id).toArray();
    if (items.length === 0) {
        return [];
    }

    items.sort((a, b) => a.position - b.position);

    const ids = [];
    for (const v of items) {
        ids.push(v.video_id);
    }
    const videos = await db.videos.where('id').anyOf(ids).toArray();
    const video_id_to_video: Map<string, Model.Video> = new Map();
    for (const video of videos) {
        video_id_to_video.set(video.id, map_local_video_to_video(video));
    }
    const out: Model.PlaylistEntry[] = [];
    for (const item of items) {
        const v = video_id_to_video.get(item.video_id);
        if (v === undefined) {
            out.push({
                item: item,
                video: unavailable_video(item.video_id)
            });
        }
        else {
            out.push({
                item: item,
                video: v
            });
        }
    }

    return out;
}
