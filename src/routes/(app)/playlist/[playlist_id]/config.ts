import type { Model } from '$data/models/index.js';
import type { SortMenu } from "$lib/components/menus/index.js";
import type { Tuple } from '$lib/utils/types.js';


export type SortByMode = SortMenu.SortMode<Model.PlaylistEntry>;

export const SORT_MODES = [
    {
        id: "manual",
        label: "Manual",
        compare_fn: (a, b) => a.item.position - b.item.position,
    },
    {
        id: "added_new",
        label: "Added newest",
        compare_fn: (a, b) => b.item.created_at.localeCompare(a.item.created_at),
    },
    {
        id: "added_old",
        label: "Added oldest",
        compare_fn: (a, b) => a.item.created_at.localeCompare(b.item.created_at),
    },
    {
        id: "channel_az",
        label: "Channel A to Z",
        compare_fn: (a, b) => a.video.channel_title.localeCompare(b.video.channel_title),
    },
    {
        id: "channel_za",
        label: "Channel Z to A",
        compare_fn: (a, b) => b.video.channel_title.localeCompare(a.video.channel_title),
    },
    {
        id: "published_new",
        label: "Published newest",
        compare_fn: (a, b) => b.video.created_at.localeCompare(a.video.created_at),
    },
    {
        id: "published_old",
        label: "Published oldest",
        compare_fn: (a, b) => a.video.created_at.localeCompare(b.video.created_at),
    },
    {
        id: "title_az",
        label: "Title A to Z",
        compare_fn: (a, b) => a.video.title.localeCompare(b.video.title),
    },
    {
        id: "title_za",
        label: "Title Z to A",
        compare_fn: (a, b) => b.video.title.localeCompare(a.video.title),
    },
    {
        id: "duration_10",
        label: "Duration longest",
        compare_fn: (a, b) => b.video.duration_s - a.video.duration_s,
    },
    {
        id: "duration_01",
        label: "Duration shortest",
        compare_fn: (a, b) => a.video.duration_s - b.video.duration_s,
    },
] satisfies Tuple<SortByMode>;

export const DEFAULT_SORT_MODE = SORT_MODES[0];
