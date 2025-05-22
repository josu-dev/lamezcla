import type { Model } from '$data/models/index.js';
import type { Async, AsyncArray, AsyncOptional, AsyncVoid } from '$lib/utils/index.js';
import { uuidv4 } from '$lib/utils/index.js';
import { HISTORY_PLAYLIST_ID, LIKES_PLAYLIST_ID, MOST_PLAYED_100_PLAYLIST_ID, MOST_PLAYED_50_PLAYLIST_ID, SUBSET_PLAYLIST_ID } from '../constants.js';
import { is_computed_playlist_id, is_local_playlist_id, play_record, play_record_to_playlist_item, playlist_item, system_playlist } from '../shared.js';
import type { DexieWithTables } from './db.js';
import { delete_lplaylist_by_id, select_lplaylist_by_id, update_lplaylist_by_id, upsert_lplaylist } from './lplaylists.js';
import { count_play_records, select_last_play_record, select_play_records, upsert_play_record } from './play_records.js';
import { delete_playlist_items_by_playlist_id, select_playlist_items_by_playlist_id, upsert_playlists_items } from './playlists_items.js';
import { expand_video_compact, normalize_playlist_entries } from './shared.js';
import { count_videos_most_played, select_videos_by_ids, select_videos_most_played } from './videos.js';
import { select_yplaylist_by_id, upsert_yplaylist } from './yplaylists.js';


export async function upsert_playlist(value: Model.AnyPlaylist): AsyncVoid {
    if (value.tag === 'l') {
        await upsert_lplaylist(value);
    }
    else {
        await upsert_yplaylist(value);
    }
}

export async function select_playlist_by_id(id: string): AsyncOptional<Model.AnyPlaylist> {
    const query = is_local_playlist_id(id) ? select_lplaylist_by_id : select_yplaylist_by_id;
    const out = await query(id);
    if (out === undefined) {
        return;
    }
    if (id === HISTORY_PLAYLIST_ID) {
        out.item_count = await count_play_records();
    }
    else if (id === MOST_PLAYED_50_PLAYLIST_ID) {
        out.item_count = await count_videos_most_played(50);
    }
    else if (id === MOST_PLAYED_100_PLAYLIST_ID) {
        out.item_count = await count_videos_most_played(100);
    }
    return out;
}

export async function select_playlist_entries_by_most_played_videos(playlist_id: Model.StringId, limit: number): AsyncArray<Model.PlaylistEntry> {
    const videos = await select_videos_most_played(limit);

    const out: Model.PlaylistEntry[] = new Array(videos.length);
    for (let i = 0; i < out.length; i++) {
        const video = videos[i];
        const item = playlist_item({
            id: `${playlist_id}_${i}`,
            playlist_id: playlist_id,
            position: i + 1,
            video_id: video.id,
        });
        out[i] = {
            id: item.id,
            item: item,
            video: video
        };
    }

    return out;
}

export async function select_playlist_entries_by_id(id: string): AsyncArray<Model.PlaylistEntry> {
    let compact_items: Model.PlaylistItemCompact[];
    if (is_computed_playlist_id(id)) {
        if (id === HISTORY_PLAYLIST_ID) {
            const play_records = await select_play_records(0, 250);
            compact_items = new Array(play_records.length);
            for (let i = 0; i < compact_items.length; i++) {
                compact_items[i] = play_record_to_playlist_item(play_records[i]);
            }
        }
        else if (id === MOST_PLAYED_50_PLAYLIST_ID) {
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

export async function recount_playlists_items(values: Model.AnyPlaylist[]): AsyncVoid {
    const [play_records_count, most_played_count] = await Promise.all([
        count_play_records(),
        count_videos_most_played(100),
    ]);
    for (const value of values) {
        if (value.tag === 'y') {
            continue;
        }
        if (value.id === HISTORY_PLAYLIST_ID) {
            value.item_count = play_records_count;
            continue;
        }
        if (value.id === MOST_PLAYED_50_PLAYLIST_ID) {
            value.item_count = most_played_count > 50 ? 50 : most_played_count;
            continue;
        }
        if (value.id === MOST_PLAYED_100_PLAYLIST_ID) {
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

    await upsert_play_record(play_record({ video_id: video_id }));
    await update_lplaylist_by_id(HISTORY_PLAYLIST_ID, (v) => v.item_count++);
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

export async function add_playlist_subset(source_playlist: Model.AnyPlaylist, source_entries: Model.PlaylistEntry[]): Async<Model.AnyChannel> {
    const playlist_length = source_entries.length;
    const title = `Subset: ${source_playlist.title.slice(source_playlist.title.startsWith("Subset: ") ? 8 : 0)}`;
    const playlist = system_playlist({
        id: SUBSET_PLAYLIST_ID,
        title: title,
        description: source_playlist.description,
        img: source_playlist.img,
        item_count: playlist_length,
        sortable: source_playlist.sortable,
    });

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

export async function delete_user_playlist_by_id(id: Model.StringId) {
    const [playlist_deleted,] = await Promise.all([
        delete_lplaylist_by_id(id),
        delete_playlist_items_by_playlist_id(id),
    ]);
    return playlist_deleted;
}

export async function seed_playlists(db: DexieWithTables): AsyncVoid {
    await db.lplaylists.put(system_playlist({
        id: HISTORY_PLAYLIST_ID,
        title: 'History',
        description: 'History of played tracks',
        computed: true,
        pinneable: true
    }));

    await db.lplaylists.put(system_playlist({
        id: LIKES_PLAYLIST_ID,
        title: `Likes`,
        description: '',
        pinneable: true
    }));

    await db.lplaylists.put(system_playlist({
        id: MOST_PLAYED_50_PLAYLIST_ID,
        title: `50's most played`,
        description: '',
        computed: true,
        pinneable: true
    }));

    await db.lplaylists.put(system_playlist({
        id: MOST_PLAYED_100_PLAYLIST_ID,
        title: `100's most played`,
        description: '',
        computed: true,
        pinneable: true
    }));
}
