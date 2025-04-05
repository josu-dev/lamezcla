import type { DexieWithTables } from '$lib/client/db/db.js';
import type * as Model from '$lib/models/youtube.js';
import { VIDEO_FLAGS } from '$lib/models/youtube.js';
import type { VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';

export type LocalVideo = {
    id: string,
    flags: number,
    channel_id: string;
    channel_title: string;
    img: undefined | Model.Image;
    published_at: string;
    title: string;
    total_seconds: number;
};

export type Table = EntityTable<LocalVideo, 'id'>;

export const TABLE_NAME = 'videos';
export const TABLE_INDEXES = 'id, channel_id';
// videos: 'id, channel_id, channel_title, published_at, title, duration, duration_seconds, embeddable, privacy_status',

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

function seconds_to_duration(value: number) {
    return {
        d: Math.floor(value / 86400),
        h: Math.floor((value % 86400) / 3600),
        m: Math.floor((value % 3600) / 60),
        s: value % 60,
    };
}

export function map_local_video_to_video(value: LocalVideo): Model.Video {
    const out: Model.Video = {
        ...value,
        duration: seconds_to_duration(value.total_seconds),
        is_available: (VIDEO_FLAGS.IS_AVAILABLE & value.flags) !== 0,
        is_public: (VIDEO_FLAGS.IS_PUBLIC & value.flags) !== 0,
        is_private: (VIDEO_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: (VIDEO_FLAGS.IS_UNLISTED & value.flags) !== 0,
        is_embeddable: (VIDEO_FLAGS.IS_EMBEDDABLE & value.flags) !== 0,
    };

    return out;
}

export function unavailable_video(id: string): Model.Video {
    return {
        id: id,
        flags: 0,
        channel_id: '',
        channel_title: '',
        img: undefined,
        published_at: '',
        title: '',
        total_seconds: 0,
        duration: {
            s: 0,
            m: 0,
            h: 0,
            d: 0,
        },
        is_available: false,
        is_public: false,
        is_private: false,
        is_unlisted: false,
        is_embeddable: false,
    };
}

export async function select_playlist_entries(id: string) {
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

export async function insert_videos(value: Model.VideoCompact[]): VoidPromise {
    await db.videos.bulkPut(value).catch('BulkError', (error) => {
        console.info(error);
    });
}
