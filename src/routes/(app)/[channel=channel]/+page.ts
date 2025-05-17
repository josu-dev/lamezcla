import { db } from '$data/local/db/index.js';
import type { Model } from '$data/models/index.js';
import { load_error } from '$data/providers/utils.js';
import { youtube } from '$data/providers/youtube/client/index.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    const is_handle = params.channel.startsWith('@');
    let channel: undefined | Model.AnyChannel;
    if (is_handle) {
        channel = await db.select_channel_by_handle(params.channel);
    }
    else {
        channel = await db.select_channel_by_id(params.channel);
    }

    let save_channel = false;
    if (channel === undefined) {
        const r = await youtube.get_channel(params.channel, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Channel '${params.channel}' not found`,
                other: `Channel '${params.channel}' couldn't be loaded`
            });
        }

        channel = r.value;
        save_channel = true;
        await db.upsert_channel(channel);
    }

    let playlists: Model.AnyPlaylist[];
    if (channel.tag === 'y') {
        let yplaylists = await db.select_yplaylists_by_channel_id(channel.id);
        if (save_channel || yplaylists === undefined || yplaylists.length === 0) {
            const r = await youtube.get_channel_playlists(channel.id, fetch);
            if (r.is_err) {
                load_error(r.error, {
                    404: `Playlists for channel '${params.channel}' couldn't be loaded`,
                    other: `Playlists for channel '${params.channel}' couldn't be loaded`
                });
            }

            yplaylists = r.value;
            await db.upsert_yplaylists(yplaylists);
        }
        playlists = yplaylists;
    }
    else {
        playlists = await db.select_lplaylists_by_channel_id(channel.id);
        await db.recount_playlists_items(playlists);
    }

    return {
        channel: channel,
        playlists: playlists,
    };
};
