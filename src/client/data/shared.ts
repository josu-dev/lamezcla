import type * as Model from '$lib/models/index.js';
import { PLAYLIST_ITEM_FLAGS } from '$lib/models/index.js';
import { VIDEO_FLAGS } from '$lib/models/youtube.js';
import type { LocalVideo } from './query/localdb/videos.js';


export function is_video_compact_unavailable(value: Model.SomeVideo): value is Model.VideoCompactUnavailable {
    return value.flags === VIDEO_FLAGS.NO_FLAGS;
}

export function unavailable_video(id: string): Model.Video {
    return {
        id: id,
        flags: 0,
        channel_id: '',
        channel_title: '',
        img: {
            url: "https://i.ytimg.com/img/no_thumbnail.jpg",
            width: 120,
            height: 90,
        },
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

function seconds_to_duration(value: number) {
    return {
        d: Math.floor(value / 86400),
        h: Math.floor((value % 86400) / 3600),
        m: Math.floor((value % 3600) / 60),
        s: value % 60,
    };
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

export function extract_playlist_item_flags_of_video(video: undefined | Model.VideoCompact) {
    if (video === undefined || video.flags === 0) {
        return PLAYLIST_ITEM_FLAGS.IS_UNAVAILABLE;
    }

    return 0;
}

export function map_local_playlist_item_to_playlist_item(value: Model.PlaylistItemCompact): Model.PlaylistItem {
    const is_deleted = (PLAYLIST_ITEM_FLAGS.IS_DELETED & value.flags) !== 0;
    const is_not_found = (PLAYLIST_ITEM_FLAGS.IS_UNAVAILABLE & value.flags) !== 0;
    const is_public = (PLAYLIST_ITEM_FLAGS.IS_PUBLIC & value.flags) !== 0;
    const is_unlisted = (PLAYLIST_ITEM_FLAGS.IS_UNLISTED & value.flags) !== 0;

    const out: Model.PlaylistItem = {
        ...value,
        is_available: (is_public || is_unlisted) && !(is_deleted || is_not_found),
        is_public: is_public,
        is_private: (PLAYLIST_ITEM_FLAGS.IS_PRIVATE & value.flags) !== 0,
        is_unlisted: is_unlisted,
        is_deleted: is_deleted
    };

    return out;
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

        const item: Model.PlaylistItem = map_local_playlist_item_to_playlist_item(compact_item);

        out.push({
            item: item,
            video: video
        });
    }

    return out;
}
