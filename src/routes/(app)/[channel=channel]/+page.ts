import { localapi, localdb } from '$client/data/query/index.js';
import type * as Model from '$lib/models/youtube.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    const is_handle = params.channel.startsWith('@');
    let channel: undefined | Model.Channel;
    if (is_handle) {
        channel = await localdb.select_channel_by_handle(params.channel);
    }
    else {
        channel = await localdb.select_channel(params.channel);
    }

    let save_channel = false;
    if (channel === undefined) {
        const r = await localapi.get_channel(params.channel, fetch);
        if (r.is_err) {
            localapi.load_error(r.error, {
                404: `Channel '${params.channel}' not found`,
                other: `Channel '${params.channel}' couldn't be loaded`
            });
        }

        channel = r.value;
        save_channel = true;
        await localdb.upsert_channel(channel);
    }

    let playlists = await localdb.select_playlists_by_channel_id(channel.id);
    if (save_channel || playlists === undefined || playlists.length === 0) {
        const r = await localapi.get_channel_playlists(channel.id, fetch);
        if (r.is_err) {
            localapi.load_error(r.error, {
                404: `Playlists for channel '${params.channel}' couldn't be loaded`,
                other: `Playlists for channel '${params.channel}' couldn't be loaded`
            });
        }

        playlists = r.value;
        await localdb.upsert_playlists(playlists);
    }

    return {
        channel: channel,
        playlists: playlists,
    };
};
