import type { Model } from '$data/models/index.js';
import type { AsyncVoid } from '$lib/utils/types.js';
import { update_lplaylist_by_id } from './lplaylists.js';
import { update_playlist_item_by_id } from './playlists_items.js';
import { update_video_by_id } from './videos.js';
import { update_yplaylist_by_id } from './yplaylists.js';


function inc_play_count(this: { value: Model.PlayCountableTrait; }): void {
    this.value.play_count += 1;
}

export async function inc_lplaylist_play_count(id: Model.StringId): AsyncVoid {
    await update_lplaylist_by_id(id, inc_play_count);
}

export async function inc_yplaylist_play_count(id: Model.StringId): AsyncVoid {
    await update_yplaylist_by_id(id, inc_play_count);
}

export async function inc_playlist_item_play_count(id: Model.StringId): AsyncVoid {
    await update_playlist_item_by_id(id, inc_play_count);
}

export async function inc_video_play_count(id: Model.StringId): AsyncVoid {
    await update_video_by_id(id, inc_play_count);
}
