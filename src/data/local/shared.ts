import type { Model } from '$data/models/index.js';
import { PLAYLIST_ITEM_FLAGS, VIDEO_FLAGS } from '$data/models/index.js';
import { now_utc, uuidv4 } from '$lib/utils/index.js';
import * as c from './constants.js';


export function is_history_playlist_id(id: Model.StringId): boolean {
    return id === c.HISTORY_PLAYLIST_ID;
}

export function is_computed_playlist_id(id: Model.StringId): boolean {
    return id.startsWith(c.ID_PREFIX_COMPUTED_PLAYLIST);
}

const local_playlist_prefixes_re = new RegExp('^P[CUS]-');

export function is_local_playlist_id(id: Model.StringId): boolean {
    return local_playlist_prefixes_re.test(id);
}

function user_playlist_id(): Model.StringId {
    return c.ID_PREFIX_USER_PLAYLIST + uuidv4();
}

export function user_playlist({
    title, description, img, item_count = 0
}: {
    title: string, description: string, img?: Model.Image, item_count?: number;
}): Model.LPlaylist {
    const now = now_utc();
    const out: Model.LPlaylist = {
        id: user_playlist_id(),
        channel_id: c.ME_CHANNEL_ID,
        title: title,
        description: description,
        img: img,
        tag: 'l',
        computed: false,
        pinneable: true,
        sortable: true,
        system: false,
        item_count: item_count ?? 0,
        play_count: 0,
        created_at: now,
        updated_at: now
    };
    return out;
}

function user_playlist_item_id(): Model.StringId {
    return c.ID_PREFIX_LOCAL_PLAYLIST_ITEM + uuidv4();
}

export function playlist_item({
    id, playlist_id, video_id, position = 0
}: {
    id: Model.StringId, playlist_id: string, video_id: string, position?: number;
}): Model.PlaylistItem {
    const now = now_utc();
    const out: Model.PlaylistItem = {
        id: id,
        playlist_id: playlist_id,
        video_id: video_id,
        flags: PLAYLIST_ITEM_FLAGS.IS_PUBLIC,
        play_count: 0,
        created_at: now,
        position: position,
        is_available: true,
        is_deleted: false,
        is_public: true,
        is_private: false,
        is_unlisted: false
    };
    return out;
}

export function user_playlist_item_compact({
    playlist_id, video_id, position = 1
}: {
    playlist_id: string, video_id: string, position?: number;
}): Model.PlaylistItemCompact {
    const now = now_utc();
    const out: Model.PlaylistItemCompact = {
        id: user_playlist_item_id(),
        playlist_id: playlist_id,
        video_id: video_id,
        flags: PLAYLIST_ITEM_FLAGS.IS_PUBLIC,
        play_count: 0,
        created_at: now,
        position: position
    };
    return out;
}

export function play_record_to_playlist_item(value: Model.PlayRecord): Model.PlaylistItem {
    const out: Model.PlaylistItem = {
        id: value.id,
        playlist_id: c.HISTORY_PLAYLIST_ID,
        video_id: value.video_id,
        created_at: value.created_at,
        flags: PLAYLIST_ITEM_FLAGS.IS_PUBLIC,
        is_available: true,
        is_deleted: false,
        is_private: false,
        is_public: true,
        is_unlisted: false,
        play_count: 0,
        position: 0,
    };
    return out;
}

export function system_playlist({
    id, title, description, img = c.FALLBACK_IMG, item_count = 0, sortable = false, pinneable = false, computed = false
}: {
    id: Model.StringId, title: string, description: string, img?: Model.Image, item_count?: number; sortable?: boolean; pinneable?: boolean, computed?: boolean;
}): Model.LPlaylist {
    const now = now_utc();
    const out: Model.LPlaylist = {
        id: id,
        channel_id: c.ME_CHANNEL_ID,
        tag: 'l',
        title: title,
        description: description,
        img: img,
        system: true,
        computed: computed,
        pinneable: pinneable,
        sortable: sortable,
        item_count: item_count ?? 0,
        play_count: 0,
        created_at: now,
        updated_at: now
    };
    return out;
}

export function play_record({ video_id }: { video_id: Model.StringId; }): Model.PlayRecord {
    const out: Model.PlayRecord = {
        id: uuidv4(),
        video_id: video_id,
        created_at: now_utc()
    };
    return out;
}

export function is_video_compact_unavailable(value: Model.SomeVideoCompact): value is Model.VideoCompactUnavailable {
    return value.flags === VIDEO_FLAGS.NO_FLAGS;
}

export function unavailable_video(id: string): Model.Video {
    return {
        id: id,
        flags: 0,
        channel_id: '',
        channel_title: '',
        img: c.FALLBACK_IMG,
        created_at: '',
        title: '',
        duration_s: 0,
        play_count: 0,
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

function seconds_to_duration(value: number) {
    return {
        d: Math.floor(value / 86400),
        h: Math.floor((value % 86400) / 3600),
        m: Math.floor((value % 3600) / 60),
        s: value % 60,
    };
}

export function expand_some_video_compact(value: Model.SomeVideoCompact): Model.Video {
    if (is_video_compact_unavailable(value)) {
        return unavailable_video(value.id);
    }

    const out: Model.Video = {
        ...value,
        duration: seconds_to_duration(value.duration_s),
        is_available: (VIDEO_FLAGS.IS_AVAILABLE & value.flags) !== 0,
        is_public: (VIDEO_FLAGS.IS_PUBLIC & value.flags) !== 0,
        is_private: (VIDEO_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: (VIDEO_FLAGS.IS_UNLISTED & value.flags) !== 0,
        is_embeddable: (VIDEO_FLAGS.IS_EMBEDDABLE & value.flags) !== 0,
    };

    return out;
}

export function expand_video_compact(value: Model.VideoCompact): Model.Video {
    if (value.flags === VIDEO_FLAGS.NO_FLAGS) {
        return unavailable_video(value.id);
    }

    const out: Model.Video = {
        ...value,
        duration: seconds_to_duration(value.duration_s),
        is_available: (VIDEO_FLAGS.IS_AVAILABLE & value.flags) !== 0,
        is_public: (VIDEO_FLAGS.IS_PUBLIC & value.flags) !== 0,
        is_private: (VIDEO_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: (VIDEO_FLAGS.IS_UNLISTED & value.flags) !== 0,
        is_embeddable: (VIDEO_FLAGS.IS_EMBEDDABLE & value.flags) !== 0,
    };

    return out;
}

export function expand_playlist_item_compact(value: Model.PlaylistItemCompact): Model.PlaylistItem {
    const is_deleted = (PLAYLIST_ITEM_FLAGS.IS_DELETED & value.flags) !== 0;
    const is_not_found = (PLAYLIST_ITEM_FLAGS.IS_UNAVAILABLE & value.flags) !== 0;
    const is_public = (PLAYLIST_ITEM_FLAGS.IS_PUBLIC & value.flags) !== 0;
    const is_unlisted = (PLAYLIST_ITEM_FLAGS.IS_UNLISTED & value.flags) !== 0;

    const out: Model.PlaylistItem = {
        ...value,
        is_available: (is_public || is_unlisted) && !(is_deleted || is_not_found),
        is_public: is_public,
        is_private: (PLAYLIST_ITEM_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: is_unlisted,
        is_deleted: is_deleted
    };

    return out;
}

function extract_playlist_item_flags_of_video(video: undefined | Model.VideoCompact) {
    if (video === undefined || video.flags === 0) {
        return PLAYLIST_ITEM_FLAGS.IS_UNAVAILABLE;
    }

    return 0;
}

export function normalize_playlist_entries(compact_items: Model.PlaylistItemCompact[], video_id_to_video: Map<string, Model.Video>): Model.PlaylistEntry[] {
    const out: Model.PlaylistEntry[] = [];
    for (const compact_item of compact_items) {
        const v = video_id_to_video.get(compact_item.video_id);
        let video: Model.Video;
        if (v === undefined) {
            video = unavailable_video(compact_item.video_id);
        } else {
            video = v;
        }
        compact_item.flags |= extract_playlist_item_flags_of_video(v);

        const item = expand_playlist_item_compact(compact_item);

        out.push({
            id: item.id,
            item: item,
            video: video
        });
    }

    return out;
}

export function extract_videos(videos_raw: Array<Model.SomeVideoCompact>, videos_compact_available: Array<Model.VideoCompact>, videos: Array<Model.Video>, video_id_to_video: Map<string, Model.Video>): void {
    for (const video_raw of videos_raw) {
        if (is_video_compact_unavailable(video_raw)) {
            continue;
        }
        const video = expand_video_compact(video_raw);
        if (!video.is_available) {
            continue;
        }
        videos_compact_available.push(video_raw);
        video_id_to_video.set(video.id, video);
        videos.push(video);
    }
}

export const SYNCHRONIZATION_ACTION = {
    NONE: "NONE",
    RESUME: "RESUME",
    HARD_REFRESH: "HARD_REFRESH"
} as const;

export type SynchronizationActionEnum = typeof SYNCHRONIZATION_ACTION;

export type SynchronizationAction =
    | { tag: SynchronizationActionEnum["NONE"]; }
    | { tag: SynchronizationActionEnum["RESUME"], next_page?: string; total_count: number; }
    | { tag: SynchronizationActionEnum["HARD_REFRESH"], next_page?: string; total_count?: number; };
