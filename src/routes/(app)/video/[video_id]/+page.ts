import { db } from '$data/local/db/index.js';
import { load_error } from '$data/providers/utils.js';
import { youtube } from '$data/providers/youtube/client/index.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    let video = await db.select_video_by_id(params.video_id);
    if (video === undefined) {
        const r = await youtube.get_video(params.video_id, fetch);
        if (r.is_err) {
            load_error(r.error, {
                404: `Video with id '${params.video_id}' not found`,
                other: `Video with id '${params.video_id}' couldn't be loaded`
            });
        }

        await db.upsert_videos([r.value]);
        video = (await db.select_video_by_id(params.video_id))!;
    }

    const channel = await db.select_channel_by_id(video.channel_id);

    return {
        video: video,
        channel: channel,
    };
};
