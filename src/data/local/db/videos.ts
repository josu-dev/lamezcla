import { expand_video_compact } from '$data/local/shared.js';
import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncNumber, AsyncOptional, AsyncVoid } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';


export type TableSchema = Model.VideoCompact;

export const TABLE_NAME = 'videos';

export const TABLE_INDEXES = 'id, channel_id, play_count';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_video(value: Model.VideoCompact): AsyncVoid {
    await db.videos.put(value);
}

export async function upsert_videos(value: Model.VideoCompact[]): AsyncVoid {
    await db.videos.bulkPut(value);
}

export async function select_video_by_id(id: Model.StringId): AsyncOptional<Model.Video> {
    const compact_video = await db.videos.where('id').equals(id).first();
    if (compact_video === undefined) {
        return;
    }

    const out = expand_video_compact(compact_video);
    return out;
}

export async function select_videos_by_ids(ids: Model.StringId[]): AsyncArray<Model.Video> {
    const compact_videos = await db.videos.where('id').anyOf(ids).toArray();

    const out: Model.Video[] = new Array(compact_videos.length);
    for (let i = 0; i < compact_videos.length; i++) {
        out[i] = expand_video_compact(compact_videos[i]);
    }
    return out;
}

export async function update_video_by_id(id: Model.StringId, fn: (value: Model.VideoCompact) => void): AsyncVoid {
    await db.videos.where('id').equals(id).modify(fn);
}

export async function count_videos_most_played(limit: number): AsyncNumber {
    const count = await db.videos.where('play_count').above(0).count();
    const out = count > limit ? limit : count;
    return out;
}

export async function select_videos_most_played(limit: number): AsyncArray<Model.Video> {
    const compact_videos = await db.videos.where('play_count').above(0).reverse().sortBy('play_count');

    const out: Model.Video[] = new Array(compact_videos.length);
    for (let i = 0; i < compact_videos.length; i++) {
        out[i] = expand_video_compact(compact_videos[i]);
    }
    return out;
}
