import type { AsyncVoid } from '$lib/utils/index.js';
import Dexie, { type EntityTable } from 'dexie';
import * as channels from './channels.js';
import * as followed_channels from './followed_channels.js';
import * as lplaylists from './lplaylists.js';
import * as pinned_items from './pinned_items.js';
import * as play_records from './play_records.js';
import * as playlists_items from './playlists_items.js';
import { seed_defaults } from './seed.js';
import * as videos from './videos.js';
import * as yplaylists from './yplaylists.js';


const DATABASE_NAME = 'lamezcla-cache';
const DATABASE_VERSION = 1;

export interface DexieWithTables extends Dexie {
    [channels.TABLE_NAME]: EntityTable<channels.TableSchema, 'id'>,
    [followed_channels.TABLE_NAME]: EntityTable<followed_channels.TableSchema, 'id'>,
    [pinned_items.TABLE_NAME]: EntityTable<pinned_items.TableSchema, 'id'>,
    [play_records.TABLE_NAME]: EntityTable<play_records.TableSchema, 'id'>,
    [yplaylists.TABLE_NAME]: EntityTable<yplaylists.TableSchema, 'id'>,
    [playlists_items.TABLE_NAME]: EntityTable<playlists_items.TableSchema, 'id'>,
    [lplaylists.TABLE_NAME]: EntityTable<lplaylists.TableSchema, 'id'>,
    [videos.TABLE_NAME]: EntityTable<videos.TableSchema, 'id'>,
};

let dexie: undefined | DexieWithTables;

export async function init(): AsyncVoid {
    dexie = new Dexie(DATABASE_NAME) as DexieWithTables;

    dexie.version(DATABASE_VERSION).stores({
        [channels.TABLE_NAME]: channels.TABLE_INDEXES,
        [followed_channels.TABLE_NAME]: followed_channels.TABLE_INDEXES,
        [pinned_items.TABLE_NAME]: pinned_items.TABLE_INDEXES,
        [play_records.TABLE_NAME]: play_records.TABLE_INDEXES,
        [yplaylists.TABLE_NAME]: yplaylists.TABLE_INDEXES,
        [playlists_items.TABLE_NAME]: playlists_items.TABLE_INDEXES,
        [lplaylists.TABLE_NAME]: lplaylists.TABLE_INDEXES,
        [videos.TABLE_NAME]: videos.TABLE_INDEXES,
    });

    dexie.on('populate', seed_defaults);

    channels.init(dexie);
    followed_channels.init(dexie);
    pinned_items.init(dexie);
    yplaylists.init(dexie);
    playlists_items.init(dexie);
    lplaylists.init(dexie);
    videos.init(dexie);
    play_records.init(dexie);
}

export async function reset(): AsyncVoid {
    if (typeof dexie === 'undefined') {
        return;
    }
    await dexie.delete();
}
