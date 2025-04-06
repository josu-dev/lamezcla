import * as localquery from '$lib/client/db/index.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    const video = await localquery.select_video(params.video_id);
    if (video === undefined) {
        return error(404, `Video with id '${params.video_id}' no loaded`);
    }

    const channel = await localquery.select_channel(video.channel_id);

    return {
        video: video,
        channel: channel,
    };
};
