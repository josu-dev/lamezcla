import type { Model } from '$data/models/index.js';
import { PLAYLIST_ITEM_FLAGS, VIDEO_FLAGS } from '$data/models/index.js';
import { FALLBACK_IMG } from '../constants.js';
import { expand_playlist_item_compact } from '../shared.js';


export function video_compact_is_unavailable(value: Model.SomeVideoCompact): value is Model.VideoCompactUnavailable {
    return value.flags === VIDEO_FLAGS.NO_FLAGS;
}

export function unavailable_video(id: string): Model.Video {
    return {
        id: id,
        flags: 0,
        channel_id: '',
        channel_title: '',
        img: FALLBACK_IMG,
        created_at: '',
        title: '',
        duration_s: 0,
        play_count: 0,
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

function seconds_to_duration(value: number) {
    return {
        d: Math.floor(value / 86400),
        h: Math.floor((value % 86400) / 3600),
        m: Math.floor((value % 3600) / 60),
        s: value % 60,
    };
}

export function expand_video_compact(value: Model.VideoCompact): Model.Video {
    if (value.flags === VIDEO_FLAGS.NO_FLAGS) {
        return unavailable_video(value.id);
    }

    const out: Model.Video = {
        ...value,
        duration: seconds_to_duration(value.duration_s),
        is_available: (VIDEO_FLAGS.IS_AVAILABLE & value.flags) !== 0,
        is_public: (VIDEO_FLAGS.IS_PUBLIC & value.flags) !== 0,
        is_private: (VIDEO_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: (VIDEO_FLAGS.IS_UNLISTED & value.flags) !== 0,
        is_embeddable: (VIDEO_FLAGS.IS_EMBEDDABLE & value.flags) !== 0,
    };

    return out;
}

function extract_playlist_item_flags_of_video(video: undefined | Model.VideoCompact) {
    if (video === undefined || video.flags === 0) {
        return PLAYLIST_ITEM_FLAGS.IS_UNAVAILABLE;
    }

    return 0;
}

export function normalize_playlist_entries(compact_items: Model.PlaylistItemCompact[], video_id_to_video: Map<string, Model.Video>): Model.PlaylistEntry[] {
    const out: Model.PlaylistEntry[] = [];
    for (const compact_item of compact_items) {
        const v = video_id_to_video.get(compact_item.video_id);
        let video: Model.Video;
        if (v === undefined) {
            video = unavailable_video(compact_item.video_id);
        } else {
            video = v;
        }
        compact_item.flags |= extract_playlist_item_flags_of_video(v);

        const item = expand_playlist_item_compact(compact_item);

        out.push({
            id: item.id,
            item: item,
            video: video
        });
    }

    return out;
}
