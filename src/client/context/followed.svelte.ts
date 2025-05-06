import { localdb } from '$client/data/query/index.js';
import type * as Model from '$lib/models/index.js';
import type { VoidPromise } from '$lib/utils/index.js';
import { create_context, now_utc, uuidv4 } from '$lib/utils/index.js';
import { SvelteSet } from 'svelte/reactivity';


class FollowedState {
    followed: Model.FollowedEntry[] = $state([]);
    #followed_ids: Set<string> = new SvelteSet();

    constructor(followed: Model.FollowedEntry[]) {
        this.followed = followed;
        for (const f of followed) {
            this.#followed_ids.add(f.id);
        }
    }

    async follow(value: Model.Channel): VoidPromise {
        const now = now_utc();
        const item: Model.FollowedChannel = {
            id: uuidv4(),
            channel_id: value.id,
            followed_at: now,
            position: this.followed.length,
        };
        await localdb.upsert_followed_channel(item);

        const new_entry: Model.FollowedEntry = {
            id: item.id,
            item: item,
            value: value,
        };
        this.followed.push(new_entry);
        this.#followed_ids.add(item.channel_id);
    }

    async unfollow(value: Model.Channel): VoidPromise {
        const id = value.id;
        await localdb.delete_followed_channel_by_channel(id);

        let i = 0;
        for (; i < this.followed.length; i++) {
            if (this.followed[i].value.id === id) {
                break;
            }
        }
        if (i === this.followed.length) {
            return;
        }

        this.followed.splice(i, 1);
        this.#followed_ids.delete(id);
    }

    is_followed(id: string): boolean {
        return this.#followed_ids.has(id);
    }
}

export type { FollowedState };

const followed_ctx = create_context<FollowedState>('followed');

export function use_followed_ctx(): FollowedState;
export function use_followed_ctx(...args: ConstructorParameters<typeof FollowedState>): FollowedState;
export function use_followed_ctx(...args: ConstructorParameters<typeof FollowedState> | []): FollowedState {
    if (args.length) {
        return followed_ctx.set(new FollowedState(...args));
    }
    return followed_ctx.get();
}
