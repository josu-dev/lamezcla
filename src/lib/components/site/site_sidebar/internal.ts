import type { FollowedState } from '$client/context/followed.svelte.js';
import type { PinnedState } from '$client/context/pinned.svelte.js';
import type { PropsNoChildren, PropsWithChildren } from '$lib/utils/types.js';
import type { Snippet } from 'svelte';


export type SidebarStateOptions = {
    pinned: PinnedState;
    followed: FollowedState;
};

export type SidebarProviderProps = PropsWithChildren<{
    pinned: PinnedState;
    followed: FollowedState;
}>;

export type SidebarStaticProps = PropsNoChildren;

export type SidebarMobileProps = PropsNoChildren;

export type SidebarContentProps = PropsNoChildren;

export type SidebarSectionProps = PropsWithChildren<{
    title?: string;
    class?: string;
}>;

export type SidebarSectionItemProps<T extends Record<string, any>> = {
    href?: string;
    item?: T;
    left_icon?: Snippet;
    right_icon?: Snippet;
    title: string;
    subtitle?: Snippet;
    is_selected?: boolean;
    on_selected?: (ev: MouseEvent) => void;
    class?: string;
};
