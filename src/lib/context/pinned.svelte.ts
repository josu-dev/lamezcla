import { db } from '$data/local/db/index.js';
import type { Model } from '$data/models/index.js';
import type { AsyncVoid } from '$lib/utils/index.js';
import { create_context, now_utc, uuidv4 } from '$lib/utils/index.js';
import { SvelteSet } from 'svelte/reactivity';


class PinnedState {
    pinned: Model.PinnedEntry[] = $state([]);
    #pinned_ids: Set<string> = new SvelteSet();

    constructor(pinned: Model.PinnedEntry[]) {
        this.pinned = pinned;
        for (const p of pinned) {
            this.#pinned_ids.add(p.item.value_id);
        }
    }

    async pin<T extends Model.PinnedItemType>(tag: T, value: Model.PinnedItemValueMap[T]): AsyncVoid {
        const now = now_utc();
        const item: Model.PinnedItem = {
            id: uuidv4(),
            tag: tag,
            created_at: now,
            updated_at: now,
            position: this.pinned.length,
            value_id: value.id,
        };
        await db.upsert_pinned_item(item);

        const new_entry = {
            id: item.id,
            tag: tag,
            item: item,
            value: value
        } as Model.PinnedEntry;
        this.pinned.push(new_entry);
        this.#pinned_ids.add(item.value_id);
    }

    async unpin(entry: Model.PinnedEntry): AsyncVoid {
        const id = entry.item.id;
        await db.delete_pinned_item_by_id(id);

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
        this.#pinned_ids.delete(entry.item.value_id);
    }

    async unpin_by_id(id: string): AsyncVoid {
        let i = 0;
        for (; i < this.pinned.length; i++) {
            if (this.pinned[i].item.value_id === id) {
                break;
            }
        }
        if (i === this.pinned.length) {
            return;
        }

        const entry = this.pinned[i];
        await db.delete_pinned_item_by_id(entry.item.id);
        this.#pinned_ids.delete(entry.item.value_id);
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

        await db.upsert_pinned_items(items);
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
