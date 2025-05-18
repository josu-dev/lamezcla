import { PLAYLIST_ITEM_FLAGS, type Model } from '$data/models/index.js';
import { now_utc, uuidv4 } from '$lib/utils/misc.js';
import type { Async, AsyncArray, AsyncOptional, AsyncVoid } from '$lib/utils/types.js';
import type { DexieWithTables } from './db.js';
import { select_lplaylist_by_id, update_lplaylist_by_id, upsert_lplaylist } from './lplaylists.js';
import { count_play_records, select_last_play_record, select_play_records, upsert_play_record } from './play_records.js';
import { delete_playlist_items_by_playlist_id, select_playlist_items_by_playlist_id, upsert_playlists_items } from './playlists_items.js';
import { expand_playlist_item_compact, expand_video_compact, FALLBACK_IMG, ID_ME_CHANNEL, normalize_playlist_entries, } from './shared.js';
import { count_videos_most_played, select_videos_by_ids, select_videos_most_played } from './videos.js';
import { select_yplaylist_by_id, upsert_yplaylist } from './yplaylists.js';


export const PREFIX_DYNAMIC_PLAYLIST = 'DP';

export const PREFIX_LOCAL_PLAYLIST = 'LP';

export const ID_SUBSET_PLAYLIST = `${PREFIX_LOCAL_PLAYLIST}_subset`;

export const ID_LIKES_PLAYLIST = `${PREFIX_LOCAL_PLAYLIST}_likes`;

export const ID_HISTORY_PLAYLIST = `${PREFIX_DYNAMIC_PLAYLIST}_history`;

export const ID_50_MOST_PLAYED_PLAYLIST = `${PREFIX_DYNAMIC_PLAYLIST}_50_most_played`;

export const ID_100_MOST_PLAYED_PLAYLIST = `${PREFIX_DYNAMIC_PLAYLIST}_100_most_played`;

export async function upsert_playlist(value: Model.AnyPlaylist): AsyncVoid {
    if (value.tag === 'l') {
        await upsert_lplaylist(value);
    }
    else {
        await upsert_yplaylist(value);
    }
}

export async function select_playlist_by_id(id: string): AsyncOptional<Model.AnyPlaylist> {
    const query = is_dynamic_or_local_playlist_id(id) ? select_lplaylist_by_id : select_yplaylist_by_id;
    const out = await query(id);
    if (out === undefined) {
        return;
    }
    if (id === ID_HISTORY_PLAYLIST) {
        out.item_count = await count_play_records();
    }
    else if (id === ID_50_MOST_PLAYED_PLAYLIST) {
        out.item_count = await count_videos_most_played(50);
    }
    else if (id === ID_100_MOST_PLAYED_PLAYLIST) {
        out.item_count = await count_videos_most_played(100);
    }
    return out;
}

export async function select_playlist_entries_by_most_played_videos(playlist_id: Model.StringId, limit: number): AsyncArray<Model.PlaylistEntry> {
    const videos = await select_videos_most_played(limit);

    const out: Model.PlaylistEntry[] = new Array(videos.length);
    for (let i = 0; i < out.length; i++) {
        const video = videos[i];
        const item_compact: Model.PlaylistItemCompact = {
            id: `${playlist_id}_${i}`,
            created_at: now_utc(),
            flags: PLAYLIST_ITEM_FLAGS.IS_PUBLIC,
            play_count: 0,
            playlist_id: playlist_id,
            position: i + 1,
            video_id: video.id,
        };
        out[i] = {
            id: item_compact.id,
            item: expand_playlist_item_compact(item_compact),
            video: video
        };
    }

    return out;
}

export async function select_playlist_entries_by_id(id: string): AsyncArray<Model.PlaylistEntry> {
    let compact_items: Model.PlaylistItemCompact[];
    if (is_dynamic_playlist_id(id)) {
        if (id === ID_HISTORY_PLAYLIST) {
            const play_records = await select_play_records(0, 250);
            compact_items = new Array(play_records.length);
            for (let i = 0; i < compact_items.length; i++) {
                compact_items[i] = play_record_to_playlist_item(play_records[i]);
            }
        }
        else if (id === ID_50_MOST_PLAYED_PLAYLIST) {
            return await select_playlist_entries_by_most_played_videos(id, 50);
        }
        else {
            return await select_playlist_entries_by_most_played_videos(id, 100);
        }
    }
    else {
        compact_items = await select_playlist_items_by_playlist_id(id);
    }

    compact_items.sort((a, b) => a.position - b.position);

    const ids = [];
    for (const v of compact_items) {
        ids.push(v.video_id);
    }

    const videos = await select_videos_by_ids(ids);
    const video_id_to_video: Map<string, Model.Video> = new Map();
    for (const video of videos) {
        if (!video.is_available) {
            continue;
        }
        video_id_to_video.set(video.id, video);
    }

    const out = normalize_playlist_entries(compact_items, video_id_to_video);

    return out;
}

export async function recount_playlists_items(values: Model.AnyPlaylist[]) {
    const [play_records_count, most_played_count] = await Promise.all([
        count_play_records(),
        count_videos_most_played(100),
        // count_videos_liked(),
    ]);
    for (const value of values) {
        if (value.tag === 'y') {
            continue;
        }
        if (value.id === ID_HISTORY_PLAYLIST) {
            value.item_count = play_records_count;
            continue;
        }
        if (value.id === ID_50_MOST_PLAYED_PLAYLIST) {
            value.item_count = most_played_count > 50 ? 50 : most_played_count;
            continue;
        }
        if (value.id === ID_100_MOST_PLAYED_PLAYLIST) {
            value.item_count = most_played_count > 100 ? 100 : most_played_count;
            continue;
        }
    }
}

export async function add_play_record(video_id: Model.StringId): AsyncVoid {
    const last_play_record = await select_last_play_record();
    if (last_play_record !== undefined && last_play_record.video_id === video_id) {
        return;
    }

    await upsert_play_record({
        id: uuidv4(),
        video_id: video_id,
        created_at: now_utc()
    });
    await update_lplaylist_by_id(ID_HISTORY_PLAYLIST, (v) => v.item_count++);
}

function play_record_to_playlist_item(value: Model.PlayRecord): Model.PlaylistItem {
    const out: Model.PlaylistItem = {
        id: value.id,
        playlist_id: ID_HISTORY_PLAYLIST,
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

export function is_history_playlist_id(id: Model.StringId): boolean {
    return id === ID_HISTORY_PLAYLIST;
}

export async function select_history_playlist_entries(page: number = 0, page_size: number = 100): AsyncArray<Model.PlaylistEntry> {
    const records = await select_play_records(page, page_size);

    const value_id_to_item: Map<string, Model.PlaylistItem> = new Map();
    const value_ids: string[] = new Array(records.length);
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        value_ids.push(record.video_id);
        value_id_to_item.set(record.video_id, play_record_to_playlist_item(record));
    }

    const values = await select_videos_by_ids(value_ids);

    const out: Model.PlaylistEntry[] = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
        const value = expand_video_compact(values[i]);
        const item = value_id_to_item.get(value.id)!;
        out[i] = {
            id: item.id,
            item: item,
            video: value,
        };
    }

    return out;
}

export function is_dynamic_playlist_id(id: Model.StringId): boolean {
    return id.startsWith(PREFIX_DYNAMIC_PLAYLIST);
}

export function is_dynamic_or_local_playlist_id(id: Model.StringId): boolean {
    return id.startsWith(PREFIX_DYNAMIC_PLAYLIST) || id.startsWith(PREFIX_LOCAL_PLAYLIST);
}

export async function add_playlist_subset(source_playlist: Model.AnyPlaylist, source_entries: Model.PlaylistEntry[]): Async<Model.AnyChannel> {
    const now = now_utc();
    const playlist_length = source_entries.length;
    const title = `Subset: ${source_playlist.title.slice(source_playlist.title.startsWith("Subset: ") ? 8 : 0)}`;
    const playlist: Model.LPlaylist = {
        id: ID_SUBSET_PLAYLIST,
        channel_id: ID_ME_CHANNEL,
        title: title,
        description: source_playlist.description,
        img: source_playlist.img,
        item_count: playlist_length,
        play_count: 0,
        sortable: source_playlist.sortable,
        created_at: now,
        updated_at: now,
        tag: "l",
        pinneable: false,
        deletable: true
    };

    const items: Model.PlaylistItemCompact[] = new Array(playlist_length);
    for (let i = 0; i < playlist_length; i++) {
        const item: Model.PlaylistItemCompact = { ...source_entries[i].item, playlist_id: playlist.id, id: uuidv4() };
        items[i] = item;
    }

    await upsert_playlist(playlist);
    await delete_playlist_items_by_playlist_id(playlist.id);
    await upsert_playlists_items(items);
    return playlist;
}

export async function seed_playlists(db: DexieWithTables) {
    const now = now_utc();

    await db.lplaylists.put({
        id: ID_HISTORY_PLAYLIST,
        channel_id: ID_ME_CHANNEL,
        title: 'History',
        description: 'History of played tracks',
        img: FALLBACK_IMG,
        item_count: 0,
        play_count: 0,
        created_at: now,
        updated_at: now,
        tag: 'l',
        pinneable: true,
        deletable: false,
        sortable: false
    });

    await db.lplaylists.put({
        id: ID_LIKES_PLAYLIST,
        channel_id: ID_ME_CHANNEL,
        title: `Likes`,
        description: '',
        img: FALLBACK_IMG,
        item_count: 0,
        play_count: 0,
        updated_at: now,
        created_at: now,
        tag: 'l',
        pinneable: true,
        deletable: false,
        sortable: false,
    });

    await db.lplaylists.put({
        id: ID_50_MOST_PLAYED_PLAYLIST,
        channel_id: ID_ME_CHANNEL,
        title: `50's most played`,
        description: '',
        img: FALLBACK_IMG,
        item_count: 0,
        play_count: 0,
        updated_at: now,
        created_at: now,
        tag: 'l',
        pinneable: true,
        deletable: false,
        sortable: false,
    });

    await db.lplaylists.put({
        id: ID_100_MOST_PLAYED_PLAYLIST,
        channel_id: ID_ME_CHANNEL,
        title: `100's most played`,
        description: '',
        img: FALLBACK_IMG,
        item_count: 0,
        play_count: 0,
        updated_at: now,
        created_at: now,
        tag: 'l',
        pinneable: true,
        deletable: false,
        sortable: false,
    });
}
