import { type FollowedState, type PinnedState } from '$client/context/index.js';
import { create_context } from '$lib/utils/index.js';
import type { SidebarStateOptions } from './internal.js';


class SiteSidebarState {
    pinned: PinnedState;
    followed: FollowedState;
    open: boolean = $state(false);

    followed_displayed = $derived.by(() => {
        return this.followed.followed.toSorted((a, b) => a.value.title.localeCompare(b.value.title));
    });
    pinned_displayed = $derived.by(() => {
        return this.pinned.pinned.toSorted((a, b) => a.item.position - b.item.position);
    });

    constructor(opts: SidebarStateOptions) {
        this.followed = opts.followed;
        this.pinned = opts.pinned;
    }

    async update_pinned(items: PinnedState['pinned']) {
        await this.pinned.reorder(items);
    }
}

const site_sidebar_ctx = create_context<SiteSidebarState>('site_sitebar');

export function use_site_sidebar_ctx(): SiteSidebarState;
export function use_site_sidebar_ctx(opts: SidebarStateOptions): SiteSidebarState;
export function use_site_sidebar_ctx(opts?: SidebarStateOptions): SiteSidebarState {
    if (opts === undefined) {
        return site_sidebar_ctx.get();
    }

    return site_sidebar_ctx.set(new SiteSidebarState(opts));
}
