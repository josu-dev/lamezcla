import type * as Model from '$lib/models/youtube.js';
import { VIDEO_FLAGS } from '$lib/models/youtube.js';
import type { LocalVideo } from './videos.js';


function seconds_to_duration(value: number) {
    return {
        d: Math.floor(value / 86400),
        h: Math.floor((value % 86400) / 3600),
        m: Math.floor((value % 3600) / 60),
        s: value % 60,
    };
}

export function is_video_compact_unavailable(value: Model.SomeVideo): value is Model.VideoCompactUnavailable {
    return value.flags === VIDEO_FLAGS.NO_FLAGS;
}

export function map_local_video_to_video(value: LocalVideo): Model.Video {
    const out: Model.Video = {
        ...value,
        duration: seconds_to_duration(value.total_seconds),
        is_available: (VIDEO_FLAGS.IS_AVAILABLE & value.flags) !== 0,
        is_public: (VIDEO_FLAGS.IS_PUBLIC & value.flags) !== 0,
        is_private: (VIDEO_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: (VIDEO_FLAGS.IS_UNLISTED & value.flags) !== 0,
        is_embeddable: (VIDEO_FLAGS.IS_EMBEDDABLE & value.flags) !== 0,
    };

    return out;
}

export function unavailable_video(id: string): Model.Video {
    return {
        id: id,
        flags: 0,
        channel_id: '',
        channel_title: '',
        img: undefined,
        published_at: '',
        title: '',
        total_seconds: 0,
        duration: {
            s: 0,
            m: 0,
            h: 0,
            d: 0,
        },
        is_available: false,
        is_public: false,
        is_private: false,
        is_unlisted: false,
        is_embeddable: false,
    };
}
