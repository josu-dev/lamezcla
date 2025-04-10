import * as apiquery from '$lib/client/api/index.js';
import * as localquery from '$lib/client/db/index.js';
import { throw_as_500 } from '$lib/utils/response.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    let video = await localquery.select_video(params.video_id);
    if (video === undefined) {
        const r = await apiquery.get_video(params.video_id, fetch);
        if (r.is_err) {
            throw_as_500(r, `Video with id '${params.video_id}' no loaded`);
        }

        await localquery.insert_videos([r.value]);
        video = (await localquery.select_video(params.video_id))!;
    }

    const channel = await localquery.select_channel(video.channel_id);

    return {
        video: video,
        channel: channel,
    };
};
