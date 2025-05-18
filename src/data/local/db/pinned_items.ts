import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncVoid } from '$lib/utils/index.js';
import { now_utc } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';
import { expand_video_compact } from './shared.js';


export type TableSchema = Model.PinnedItem;

export const TABLE_NAME = 'pinned_items';

export const TABLE_INDEXES = 'id, type, &pinned_id';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_pinned_item(value: Model.PinnedItem): AsyncVoid {
    value.updated_at = now_utc();
    await db.pinned_items.put(value);
}

export async function upsert_pinned_items(values: Model.PinnedItem[]): AsyncVoid {
    const now = now_utc();
    for (const value of values) {
        value.updated_at = now;
    }
    await db.pinned_items.bulkPut(values);
}

export async function select_pinned_items(): AsyncArray<Model.PinnedItem> {
    return await db.pinned_items.toArray();
}

export async function delete_pinned_item_by_id(id: string): AsyncVoid {
    await db.pinned_items.delete(id);
}

export async function delete_pinned_items(): AsyncVoid {
    await db.pinned_items.clear();
}

function push_pinned_entries(items: Map<string, Model.PinnedItem>, values: Model.PinnedEntry['value'][], acc: Model.PinnedEntry[]) {
    for (const v of values) {
        const item = items.get(v.id)!;
        acc.push({
            tag: item.tag,
            item: item,
            value: v
        } as any);
    }
}

export async function select_pinned_entries(): AsyncArray<Model.PinnedEntry> {
    const items = await db.pinned_items.toArray();
    const ids: Record<Model.PinnedItemType, string[]> = {
        channel: [],
        yplaylist: [],
        lplaylist: [],
        video: [],
    };
    const pinned_id_to_item: Map<string, Model.PinnedItem> = new Map();
    for (const item of items) {
        ids[item.tag].push(item.value_id);
        pinned_id_to_item.set(item.value_id, item);
    }
    const [local_channels, local_playlists, local_playlists_user, local_videos] = await Promise.all([
        db.channels.where('id').anyOf(ids.channel).toArray(),
        db.yplaylists.where('id').anyOf(ids.yplaylist).toArray(),
        db.lplaylists.where('id').anyOf(ids.lplaylist).toArray(),
        db.videos.where('id').anyOf(ids.video).toArray(),
    ]);

    const videos: Model.Video[] = [];
    for (const v of local_videos) {
        videos.push(expand_video_compact(v));
    }

    const out: Model.PinnedEntry[] = [];
    push_pinned_entries(pinned_id_to_item, local_channels as Model.YChannel[], out);
    push_pinned_entries(pinned_id_to_item, local_playlists, out);
    push_pinned_entries(pinned_id_to_item, local_playlists_user, out);
    push_pinned_entries(pinned_id_to_item, videos, out);

    return out;
}
