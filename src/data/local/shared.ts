import type { Model } from '$data/models/index.js';
import { PLAYLIST_ITEM_FLAGS } from '$data/models/index.js';
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
