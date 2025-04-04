import * as localquery from '$lib/client/db/index.js';
import type * as Model from '$lib/models/index.js';
import { now_utc, uuid } from '$lib/utils/index.js';
import { create_context, type UseContextArgs } from './shared.js';


class PinnedState {
    pinned: Model.PinnedEntry[] = $state([]);

    constructor(pinned: Model.PinnedEntry[]) {
        this.pinned = pinned;
    }

    async pin<T extends Model.PinnedItemType>(type: T, value: Model.PinnedItemValueMap[T]) {
        const now = now_utc();
        const item: Model.PinnedItem = {
            id: uuid(),
            type: type,
            pinned_at: now,
            updated_at: now,
            order: this.pinned.length,
            pinned_id: value.id,
        };
        await localquery.insert_pinned_item(item);

        const new_entry: Model.PinnedEntry = {
            type: type,
            item: item,
            value: value
        } as any;
        this.pinned.push(new_entry);
    }

    async unpin(entry: Model.PinnedEntry) {
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
    }

    async sync() {
        const pe = await localquery.select_pinned_entries();
        this.pinned = pe;
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
