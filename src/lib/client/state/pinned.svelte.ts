import * as localquery from '$lib/client/db/index.js';
import type * as Model from '$lib/models/index.js';
import { now_utc, uuid, type VoidPromise } from '$lib/utils/index.js';
import { SvelteSet } from 'svelte/reactivity';
import { create_context, type UseContextArgs } from './shared.js';


class PinnedState {
    pinned: Model.PinnedEntry[] = $state([]);
    #pinned_ids: Set<string> = new SvelteSet();

    constructor(pinned: Model.PinnedEntry[]) {
        this.pinned = pinned;
        for (const p of pinned) {
            this.#pinned_ids.add(p.item.pinned_id);
        }
    }

    async pin<T extends Model.PinnedItemType>(type: T, value: Model.PinnedItemValueMap[T]): VoidPromise {
        const now = now_utc();
        const item: Model.PinnedItem = {
            id: uuid(),
            type: type,
            pinned_at: now,
            updated_at: now,
            position: this.pinned.length,
            pinned_id: value.id,
        };
        await localquery.insert_pinned_item(item);

        const new_entry: Model.PinnedEntry = {
            type: type,
            item: item,
            value: value
        } as any;
        this.pinned.push(new_entry);
        this.#pinned_ids.add(item.pinned_id);
    }

    async unpin(entry: Model.PinnedEntry): VoidPromise {
        const id = entry.item.id;
        await localquery.delete_pinned_item(id);

        let i = 0;
        for (; i < this.pinned.length; i++) {
            if (this.pinned[i].item.id === id) {
                break;
            }
        }
        if (i === this.pinned.length) {
            return;
        }

        this.pinned.splice(i, 1);
        this.#pinned_ids.delete(entry.item.pinned_id);
    }

    async unpin_by_id(id: string): VoidPromise {
        let i = 0;
        for (; i < this.pinned.length; i++) {
            if (this.pinned[i].item.pinned_id === id) {
                break;
            }
        }
        if (i === this.pinned.length) {
            return;
        }

        const entry = this.pinned[i];
        await localquery.delete_pinned_item(entry.item.id);
        this.#pinned_ids.delete(entry.item.pinned_id);
        this.pinned.splice(i, 1);
    }

    is_pinned(id: string): boolean {
        return this.#pinned_ids.has(id);
    }
}

const pinned_ctx = create_context<PinnedState>('pinned');

export function use_pinned_ctx(): PinnedState;
export function use_pinned_ctx(...args: UseContextArgs<typeof PinnedState>): PinnedState;
export function use_pinned_ctx(...args: UseContextArgs<typeof PinnedState> | []): PinnedState {
    if (args.length) {
        return pinned_ctx.set(new PinnedState(...args));
    }
    return pinned_ctx.get();
}
