import { localdb } from '$client/data/query/index.js';
import type * as Model from '$lib/models/index.js';
import type { VoidPromise } from '$lib/utils/index.js';
import { create_context, now_utc, uuidv4, } from '$lib/utils/index.js';
import { SvelteSet } from 'svelte/reactivity';


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
            id: uuidv4(),
            type: type,
            pinned_at: now,
            updated_at: now,
            position: this.pinned.length,
            pinned_id: value.id,
        };
        await localdb.upsert_pinned_item(item);

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
        await localdb.delete_pinned_item(id);

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
        await localdb.delete_pinned_item(entry.item.id);
        this.#pinned_ids.delete(entry.item.pinned_id);
        this.pinned.splice(i, 1);
    }

    is_pinned(id: string): boolean {
        return this.#pinned_ids.has(id);
    }

    async reorder(value: Model.PinnedEntry[]) {
        const pinned_snapshot = $state.snapshot(this.pinned);
        const items: Model.PinnedItem[] = new Array(value.length);
        for (let i = 0; i < value.length; i++) {
            const item = value[i].item;
            item.position = i;
            items[i] = item;
            for (const pinned of pinned_snapshot) {
                if (pinned.item.id === item.id) {
                    pinned.item.position = item.position;
                    break;
                }
            }
        }

        await localdb.upsert_pinned_items(items);
        this.pinned = pinned_snapshot;
    }
}

export type { PinnedState };

const pinned_ctx = create_context<PinnedState>('pinned');

export function use_pinned_ctx(): PinnedState;
export function use_pinned_ctx(...args: ConstructorParameters<typeof PinnedState>): PinnedState;
export function use_pinned_ctx(...args: ConstructorParameters<typeof PinnedState> | []): PinnedState {
    if (args.length) {
        return pinned_ctx.set(new PinnedState(...args));
    }
    return pinned_ctx.get();
}
