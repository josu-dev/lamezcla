import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncVoid } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';


export type TableSchema = Model.FollowedChannel;

export const TABLE_NAME = 'followed_channels';

export const TABLE_INDEXES = 'id, &channel_id, created_at';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_followed_channel(value: Model.FollowedChannel): AsyncVoid {
    await db.followed_channels.put(value);
}

export async function delete_followed_channel_by_channel_id(id: string): AsyncVoid {
    await db.followed_channels.where('channel_id').equals(id).delete();
}

export async function delete_followed_channels(): AsyncVoid {
    await db.followed_channels.clear();
}

export async function select_followed_entries(): AsyncArray<Model.FollowedEntry> {
    const items = await db.followed_channels.orderBy('created_at').toArray();
    const ids: string[] = [];
    const channel_id_to_item: Map<string, Model.FollowedChannel> = new Map();
    for (const item of items) {
        ids.push(item.channel_id);
        channel_id_to_item.set(item.channel_id, item);
    }
    const channels = await db.channels.where('id').anyOf(ids).toArray() as Model.YChannel[];

    const out: Model.FollowedEntry[] = [];
    for (const channel of channels) {
        const item = channel_id_to_item.get(channel.id)!;
        out.push({
            id: item.id,
            item: item,
            value: channel
        });
    }

    return out;
}
