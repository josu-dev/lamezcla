import type { DexieWithTables } from '$lib/client/db/db.js';
import type * as Model from '$lib/models/youtube.js';
import { now_utc, type ArrayPromise, type OptionalPromise } from '$lib/utils/index.js';
import type { EntityTable } from 'dexie';

export type LocalChannel = {
    id: string,
    handle: string;
    img: undefined | Model.Image;
    published_at: string;
    title: string;
    updated_at: string;
};

export type Table = EntityTable<LocalChannel, 'id'>;

export const TABLE_NAME = 'channels';
export const TABLE_INDEXES = 'id, handle, title';
// channels: 'id, published_at, updated_at, title, handle, img',

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

export async function insert_channel(channel: Model.Channel): Promise<string> {
    const value: LocalChannel = { ...channel, updated_at: now_utc() };
    return await db.channels.put(value);
}

export async function delete_channel(id: string): Promise<boolean> {
    await db.channels.delete(id);
    return true;
}
