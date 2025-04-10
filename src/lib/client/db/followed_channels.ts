import type { DexieWithTables, } from '$lib/client/db/db.js';
import type * as Model from '$lib/models/index.js';
import type { ArrayPromise, VoidPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';

export type LocalFollowedChannel = Model.FollowedChannel;

export type Table = EntityTable<LocalFollowedChannel, 'id'>;

export const TABLE_NAME = 'followed_channels';
export const TABLE_INDEXES = 'id, &channel_id';

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function insert_followed_channel(value: Model.FollowedChannel): VoidPromise {
    await db.followed_channels.put(value);
}

export async function delete_followed_channel_by_channel(id: string): VoidPromise {
    await db.followed_channels.where('channel_id').equals(id).delete();
}

export async function delete_followed_channels(): VoidPromise {
    await db.followed_channels.clear();
}

export async function select_followed_entries(): ArrayPromise<Model.FollowedEntry> {
    const items = await db.followed_channels.toArray();
    const ids: string[] = [];
    const channel_id_to_item: Map<string, Model.FollowedChannel> = new Map();
    for (const item of items) {
        ids.push(item.channel_id);
        channel_id_to_item.set(item.channel_id, item);
    }
    const channels = await db.channels.where('id').anyOf(ids).toArray();

    const out: Model.FollowedEntry[] = [];
    for (const v of channels) {
        const item = channel_id_to_item.get(v.id)!;
        out.push({
            id: item.id,
            item: item,
            value: v
        });
    }

    return out;
}
