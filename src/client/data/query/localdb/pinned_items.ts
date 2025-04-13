import { map_local_video_to_video } from '$client/data/query/localdb/shared.js';
import type * as Model from '$lib/models/index.js';
import type { ArrayPromise, OptionalPromise, VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';
import type { DexieWithTables } from './db.js';


export type LocalPinnedItem = Model.PinnedItem;

export type Table = EntityTable<LocalPinnedItem, 'id'>;

export const TABLE_NAME = 'pinned_items';

export const TABLE_INDEXES = 'id, type, &pinned_id';

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function select_pinned_item(id: string): OptionalPromise<Model.PinnedItem> {
    return await db.pinned_items.where('id').equals(id).first();
}

export async function select_pinned_items(): ArrayPromise<Model.PinnedItem> {
    return await db.pinned_items.toArray();
}

export async function upsert_pinned_item(value: Model.PinnedItem): VoidPromise {
    await db.pinned_items.put(value);
}

export async function update_pinned_item(value: Model.PinnedItem): VoidPromise {
    await db.pinned_items.update(value.id, value);
}

export async function delete_pinned_item(id: string): VoidPromise {
    await db.pinned_items.delete(id);
}

export async function delete_pinned_items(): VoidPromise {
    await db.pinned_items.clear();
}

function push_pinned_entries(items: Map<string, Model.PinnedItem>, values: Model.PinnedEntry['value'][], acc: Model.PinnedEntry[]) {
    for (const v of values) {
        const item = items.get(v.id)!;
        acc.push({
            type: item.type,
            item: item,
            value: v
        } as any);
    }
}

export async function select_pinned_entries(): ArrayPromise<Model.PinnedEntry> {
    const items = await db.pinned_items.toArray();
    const ids: Record<Model.PinnedItemType, string[]> = {
        channel: [],
        playlist: [],
        playlist_custom: [],
        video: [],
    };
    const pinned_id_to_item: Map<string, Model.PinnedItem> = new Map();
    for (const item of items) {
        ids[item.type].push(item.pinned_id);
        pinned_id_to_item.set(item.pinned_id, item);
    }
    const [local_channels, local_playlists, local_videos] = await Promise.all([
        db.channels.where('id').anyOf(ids.channel).toArray(),
        db.playlists.where('id').anyOf(ids.playlist).toArray(),
        // db.playlists_custom.where('id').anyOf(ids.playlist_custom),
        db.videos.where('id').anyOf(ids.video).toArray(),
    ]);

    const videos: Model.Video[] = [];
    for (const v of local_videos) {
        videos.push(map_local_video_to_video(v));
    }

    const out: Model.PinnedEntry[] = [];
    push_pinned_entries(pinned_id_to_item, local_channels, out);
    push_pinned_entries(pinned_id_to_item, local_playlists, out);
    push_pinned_entries(pinned_id_to_item, videos, out);

    return out;
}
