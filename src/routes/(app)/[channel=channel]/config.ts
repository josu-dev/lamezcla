import type { Model } from '$data/models/index.js';
import type { SortMenu } from "$lib/components/menus/index.js";
import type { Tuple } from '$lib/utils/types.js';


export type SortMode = SortMenu.SortMode<Model.AnyPlaylist>;

export const SORT_MODES = [
    {
        id: "published_new",
        label: "Published newest",
        compare_fn: (a, b) => b.created_at.localeCompare(a.created_at),
    },
    {
        id: "published_old",
        label: "Published oldest",
        compare_fn: (a, b) => a.created_at.localeCompare(b.created_at),
    },
    {
        id: "title_az",
        label: "Title A to Z",
        compare_fn: (a, b) => a.title.localeCompare(b.title),
    },
    {
        id: "title_za",
        label: "Title Z to A",
        compare_fn: (a, b) => b.title.localeCompare(a.title),
    },
    {
        id: "tracks_01",
        label: "Track count - to +",
        compare_fn: (a, b) => a.item_count - b.item_count,
    },
    {
        id: "tracks_10",
        label: "Track count + to -",
        compare_fn: (a, b) => b.item_count - a.item_count,
    },
] satisfies Tuple<SortMode>;

export const DEFAULT_SORT_MODE = SORT_MODES[0];
