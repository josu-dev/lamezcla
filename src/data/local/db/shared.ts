import type { Model } from '$data/models/index.js';


export const ID_ME_CHANNEL = 'L9f2e8b31-979c-4477-8a8b-4f3514689d0a';

export function inc_play_count(value: Model.PlayCountableTrait): void {
    value.play_count++;
}
