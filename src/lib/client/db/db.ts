import Dexie from 'dexie';
import * as channels from './channels.js';
import * as pinned_items from './pinned_items.js';
import * as playlists from './playlists.js';
import * as playlists_items from './playlists_items.js';
import * as videos from './videos.js';


type TablesModules = (readonly { TABLE_NAME: string, TABLE_INDEXES: string, set_db(db: Dexie): void; }[]);

function attach_db(db: Dexie, modules: TablesModules): void {
    for (const module of modules) {
        module.set_db(db);
    }
}

export type DexieWithTables = Dexie & {
    [channels.TABLE_NAME]: channels.Table,
    [pinned_items.TABLE_NAME]: pinned_items.Table,
    [playlists.TABLE_NAME]: playlists.Table,
    [playlists_items.TABLE_NAME]: playlists_items.Table,
    [videos.TABLE_NAME]: videos.Table,
};

const db = new Dexie('lamezcla-cache') as DexieWithTables;

db.version(1).stores({
    [channels.TABLE_NAME]: channels.TABLE_INDEXES,
    [pinned_items.TABLE_NAME]: pinned_items.TABLE_INDEXES,
    [playlists.TABLE_NAME]: playlists.TABLE_INDEXES,
    [playlists_items.TABLE_NAME]: playlists_items.TABLE_INDEXES,
    [videos.TABLE_NAME]: videos.TABLE_INDEXES,
});

const tables = [
    channels,
    pinned_items,
    playlists,
    playlists_items,
    videos,
] as const;

attach_db(db, tables);

export { db };
