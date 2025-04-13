import type * as Model from '$lib/models/youtube.js';
import type { OptionalPromise, VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';
import type { DexieWithTables } from './db.js';
import { map_local_video_to_video } from './shared.js';


export type LocalVideo = Model.VideoCompact;

export type Table = EntityTable<LocalVideo, 'id'>;

export const TABLE_NAME = 'videos';

export const TABLE_INDEXES = 'id, channel_id';

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function select_video(id: string): OptionalPromise<Model.Video> {
    const video = await db.videos.where('id').equals(id).first();
    if (video === undefined) {
        return undefined;
    }

    const out = map_local_video_to_video(video);
    return out;
}

export async function upsert_videos(value: Model.VideoCompact[]): VoidPromise {
    await db.videos.bulkPut(value);
}
