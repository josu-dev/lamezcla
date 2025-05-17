import type { Model } from '$data/models/index.js';
import type { AsyncOptional, AsyncVoid } from '$lib/utils/index.js';
import { now_utc } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';
import { ID_ME_CHANNEL } from './shared.js';


export type TableSchema = Model.AnyChannel;

export const TABLE_NAME = 'channels';

export const TABLE_INDEXES = 'id, handle, title';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_channel(value: Model.AnyChannel): AsyncVoid {
    value.updated_at = now_utc();
    await db.channels.put(value);
}

export async function select_channel_by_id(id: string): AsyncOptional<Model.AnyChannel> {
    return await db.channels.where('id').equals(id).first();
}

export async function select_channel_by_handle(handle: string): AsyncOptional<Model.AnyChannel> {
    return await db.channels.where('handle').equals(handle).first();
}

export async function delete_channel_by_id(id: string): AsyncVoid {
    await db.channels.delete(id);
}

export async function delete_channels(): AsyncVoid {
    await db.channels.clear();
}

export async function seed_channels(db: DexieWithTables) {
    const now = now_utc();

    await db.channels.put({
        id: ID_ME_CHANNEL,
        tag: 'l',
        handle: '@me',
        title: 'me',
        img: undefined,
        created_at: now,
        updated_at: now,
    });
}
