import type { Model } from '$data/models/index.js';
import type { AsyncArray, AsyncNumber, AsyncOptional, AsyncVoid } from '$lib/utils/index.js';
import type { DexieWithTables } from './db.js';


export type TableSchema = Model.PlayRecord;

export const TABLE_NAME = 'play_records';

export const TABLE_INDEXES = 'id, created_at';

let db: DexieWithTables;

export function init(instance: DexieWithTables) {
    db = instance;
}

export async function upsert_play_record(value: Model.PlayRecord): AsyncVoid {
    await db.play_records.put(value);
}

export async function select_play_records(page: number = 0, page_size: number = 100): AsyncArray<Model.PlayRecord> {
    const out = await db.play_records.orderBy('created_at').reverse().offset(page * page_size).limit(page_size).toArray();
    return out;
}

export async function delete_play_record_by_video_id(id: Model.StringId): AsyncVoid {
    await db.play_records.where('video_id').equals(id).delete();
}

export async function delete_play_records(): AsyncVoid {
    await db.play_records.clear();
}

export async function count_play_records(): AsyncNumber {
    return await db.play_records.count();
}

export async function select_last_play_record(): AsyncOptional<Model.PlayRecord> {
    return await db.play_records.orderBy('created_at').first();
}
