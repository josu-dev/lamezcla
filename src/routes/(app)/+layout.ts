import * as localdb from '$lib/client/db/index.js';
import type * as Model from '$lib/models/index.js';
import type { LayoutLoad } from './$types.js';

export const ssr = false;

export const load: LayoutLoad = async () => {
    const channels = await localdb.select_channels();
    const pinned = await localdb.select_pinned_entries();
    // const pinned = get_pinned_mockup();

    return {
        channels: channels,
        pinned: pinned,
    };
};

function get_pinned_mockup(): Model.PinnedEntry[] {
    const pinnedVideoAvailable: Model.PinnedEntry = {
        type: 'video',
        item: {
            type: 'video',
            pinned_id: 'vid_001',
            id: 'pin_001',
            pinned_at: '2025-04-03T10:00:00Z',
            updated_at: '2025-04-03T10:00:00Z',
            position: 1,
        },
        value: {
            id: 'vid_001',
            flags: 1,
            channel_id: 'chan_001',
            channel_title: 'Tech Reviews',
            img: { url: 'https://example.com/thumb1.jpg', width: 1280, height: 720 },
            published_at: '2025-01-01T00:00:00Z',
            title: 'Latest Gadget Review',
            total_seconds: 300,
            duration: { s: 0, m: 5, h: 0, d: 0 },
            is_available: true,
            is_public: true,
            is_private: false,
            is_unlisted: false,
            is_embeddable: true,
        },
    };
    const pinnedPlaylist: Model.PinnedEntry = {
        type: 'playlist',
        item: {
            type: 'playlist',
            pinned_id: 'pl_001',
            id: 'pin_003',
            pinned_at: '2025-04-03T12:00:00Z',
            updated_at: '2025-04-03T12:00:00Z',
            position: 3,
        },
        value: {
            id: 'pl_001',
            channel_id: 'chan_003',
            description: 'A collection of coding tutorials.',
            img: { url: 'https://example.com/pl_thumb1.jpg', width: 640, height: 360 },
            item_count: 10,
            privacy_status: 'public',
            published_at: '2025-03-01T00:00:00Z',
            updated_at: '2025-04-01T00:00:00Z',
            title: 'Coding 101',
        },
    };
    const pinnedPlaylistCustom: Model.PinnedEntry = {
        type: 'playlist_custom',
        item: {
            type: 'playlist_custom',
            pinned_id: 'pl_custom_001',
            id: 'pin_004',
            pinned_at: '2025-04-03T13:00:00Z',
            updated_at: '2025-04-03T13:00:00Z',
            position: 4,
        },
        value: {
            id: 'pl_custom_001',
            channel_id: 'user_001', // Could be a user ID instead of a channel
            description: 'My favorite workout songs.',
            img: undefined,
            item_count: 5,
            privacy_status: 'private',
            published_at: '2025-03-15T00:00:00Z',
            updated_at: '2025-04-02T00:00:00Z',
            title: 'Workout Mix',
        },
    };
    const pinnedChannel: Model.PinnedEntry = {
        type: 'channel',
        item: {
            type: 'channel',
            pinned_id: 'chan_004',
            id: 'pin_005',
            pinned_at: '2025-04-03T14:00:00Z',
            updated_at: '2025-04-03T14:00:00Z',
            position: 5,
        },
        value: {
            id: 'chan_004',
            handle: '@GamingCentral',
            title: 'Gaming Central',
            img: { url: 'https://example.com/channel4.jpg', width: 800, height: 800 },
            published_at: '2024-01-01T00:00:00Z',
            updated_at: '2025-04-01T00:00:00Z',
        },
    };

    return [
        pinnedChannel,
        pinnedPlaylist,
        pinnedPlaylistCustom,
        pinnedVideoAvailable
    ];
}
