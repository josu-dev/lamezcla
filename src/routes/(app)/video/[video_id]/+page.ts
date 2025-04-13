import { localapi, localdb } from '$client/data/query/index.js';
import { throw_as_500 } from '$lib/utils/response.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ params, fetch }) => {
    let video = await localdb.select_video(params.video_id);
    if (video === undefined) {
        const r = await localapi.get_video(params.video_id, fetch);
        if (r.is_err) {
            throw_as_500(r, `Video with id '${params.video_id}' no loaded`);
        }

        await localdb.upsert_videos([r.value]);
        video = (await localdb.select_video(params.video_id))!;
    }

    const channel = await localdb.select_channel(video.channel_id);

    return {
        video: video,
        channel: channel,
    };
};
