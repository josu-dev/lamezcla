import * as apiquery from '$lib/client/api/index.js';
import * as localquery from '$lib/client/db/index.js';
import * as Model from '$lib/models/youtube.js';
import { throw_as_500 } from '$lib/utils/response.js';
import type { PageLoad } from './$types.js';


export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
    const is_handle = params.channel.startsWith('@');
    let channel: undefined | Model.Channel;
    if (is_handle) {
        channel = await localquery.select_channel_by_handle(params.channel);
    }
    else {
        channel = await localquery.select_channel(params.channel);
    }

    if (channel === undefined) {
        const r_channel = await apiquery.get_channel(params.channel, fetch);
        if (r_channel.is_err) {
            throw_as_500(r_channel, `Channel '${params.channel}' couldn't be loaded`);
        }

        channel = r_channel.value;
        await localquery.insert_channel(channel);
    }

    let playlists = await localquery.select_playlists_by_channel_id(channel.id);
    if (playlists === undefined || playlists.length === 0) {
        const r_playlists = await apiquery.get_channel_playlists(channel.id, fetch);
        if (r_playlists.is_err) {
            throw_as_500(r_playlists, `Playlists for channel '${params.channel}' couldn't be loaded`);
        }

        playlists = r_playlists.value;
        await localquery.insert_playlists(playlists);
    }

    return {
        channel: channel,
        playlists: playlists,
    };
};
