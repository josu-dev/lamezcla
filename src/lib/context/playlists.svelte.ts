import { SUBSET_PLAYLIST_ID } from '$data/local/constants.js';
import { db } from '$data/local/db/index.js';
import { expand_playlist_item_compact, user_playlist, user_playlist_item_compact } from '$data/local/shared.js';
import type { Model } from '$data/models/index.js';
import type { Async, AsyncArray, AsyncBoolean } from '$lib/utils/index.js';
import { create_context, now_utc } from '$lib/utils/index.js';
import { SvelteSet } from 'svelte/reactivity';


export type PlaylistForVideo = { id: Model.StringId, playlist: Model.LPlaylist, item: undefined | Model.PlaylistItem; };

class PlaylistsState {
    #playlists: Model.LPlaylist[] = $state([]);
    #playlists_ids: Set<string> = new SvelteSet();

    constructor(playlists: Model.LPlaylist[]) {
        this.#playlists = playlists;
        for (const f of playlists) {
            this.#playlists_ids.add(f.id);
        }
    }

    async delete_playlist(id: Model.StringId): AsyncBoolean {
        const success = await db.delete_user_playlist_by_id(id);
        const out = true;
        return out;
    }

    async create_lplaylist_for_video(title: string, description: string, video_id: Model.StringId): Async<PlaylistForVideo> {
        const playlist: Model.LPlaylist = user_playlist({
            title: title,
            description: description,
            item_count: video_id === undefined ? 0 : 1
        });
        const item: Model.PlaylistItemCompact = user_playlist_item_compact({
            video_id: video_id,
            playlist_id: playlist.id
        });
        Promise.all([
            db.upsert_lplaylist(playlist),
            db.upsert_playlist_item(item)
        ]);

        const out: PlaylistForVideo = {
            id: playlist.id,
            playlist: playlist,
            item: item ? expand_playlist_item_compact(item) : item
        };
        return out;
    }

    async get_lplaylists_for_video(id: Model.StringId): AsyncArray<PlaylistForVideo> {
        const playlists_items = await db.select_playlists_item_by_video_id(id);
        const playlist_id_to_playlist_item: Map<Model.StringId, Model.PlaylistItemCompact> = new Map();
        for (const item of playlists_items) {
            playlist_id_to_playlist_item.set(item.playlist_id, item);
        }
        const playlists = await db.select_lplaylists_filtered((x) =>
            !(x.computed || x.id === SUBSET_PLAYLIST_ID)
        );
        const out: PlaylistForVideo[] = [];
        for (const playlist of playlists) {
            const item = playlist_id_to_playlist_item.get(playlist.id);
            out.push({
                id: playlist.id,
                playlist: playlist,
                item: item === undefined ? undefined : expand_playlist_item_compact(item)
            });
        }
        return out;
    }

    async add_to_playlist(playlist_id: Model.StringId, video_id: Model.StringId): Async<false | Model.PlaylistItem> {
        const playlist = await db.select_lplaylist_by_id(playlist_id);
        if (playlist === undefined) {
            return false;
        }

        playlist.item_count += 1;
        const item: Model.PlaylistItemCompact = user_playlist_item_compact({
            playlist_id: playlist_id,
            video_id: video_id,
            position: playlist.item_count,
        });
        Promise.all([
            db.upsert_lplaylist(playlist),
            db.upsert_playlist_item(item)
        ]);
        const out = expand_playlist_item_compact(item);
        return out;
    }

    async remove_from_playlist(playlist_id: Model.StringId, video_id: Model.StringId): AsyncBoolean {
        const playlist = await db.select_lplaylist_by_id(playlist_id);
        if (playlist === undefined) {
            return false;
        }

        Promise.all([
            await db.update_yplaylist_by_id(
                playlist_id,
                v => { v.item_count -= 1; v.updated_at = now_utc(); }
            ),
            await db.delete_playlist_item_by_playlist_and_video_id(playlist_id, video_id)
        ]);

        return true;
    }

    get playlists(): Model.LPlaylist[] {
        return this.#playlists;
    }
}

export type { PlaylistsState };

const playlists_ctx = create_context<PlaylistsState>('playlists');

export function use_playlists_ctx(): PlaylistsState;
export function use_playlists_ctx(...args: ConstructorParameters<typeof PlaylistsState>): PlaylistsState;
export function use_playlists_ctx(...args: ConstructorParameters<typeof PlaylistsState> | []): PlaylistsState {
    if (args.length) {
        return playlists_ctx.set(new PlaylistsState(...args));
    }
    return playlists_ctx.get();
}
