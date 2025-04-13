import type * as Model from '$lib/models/index.js';
import type { ArrayPromise, OptionalPromise, VoidPromise } from '$lib/utils/index.js';
import { now_utc, } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';
import type { DexieWithTables } from './db.js';


export type LocalChannel = Model.Channel;

export type Table = EntityTable<LocalChannel, 'id'>;

export const TABLE_NAME = 'channels';

export const TABLE_INDEXES = 'id, handle, title';

let db: DexieWithTables;

export function set_db(instance: DexieWithTables) {
    db = instance;
}

export async function select_channel(id: string): OptionalPromise<Model.Channel> {
    return await db.channels.where('id').equals(id).first();
}

export async function select_channel_by_handle(handle: string): OptionalPromise<Model.Channel> {
    return await db.channels.where('handle').equals(handle).first();
}

export async function select_channels(): ArrayPromise<Model.Channel> {
    return await db.channels.orderBy('title').toArray();
}

export async function upsert_channel(channel: Model.Channel): VoidPromise {
    const value: LocalChannel = { ...channel, updated_at: now_utc() };
    await db.channels.put(value);
}

export async function delete_channel(id: string): VoidPromise {
    await db.channels.delete(id);
}
