import type { PropsNoChildren, PropsWithChildren } from '$lib/utils/types.js';
import type { LucideComponent } from '@lucide/svelte';
import type { DropdownMenuContentProps, DropdownMenuTriggerProps } from 'bits-ui';
import type { Component, ComponentProps } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';


export type IconProp = {
    Icon: Component;
    props?: ComponentProps<typeof LucideComponent>;
};

export type MenuAction = {
    id: number;
    label: string;
    icon_left?: IconProp;
} & (
        | { tag: "a"; onSelect?: (event: Event) => void; props: HTMLAnchorAttributes; }
        | { tag: "button"; onSelect: (event: Event) => void; props?: HTMLButtonAttributes; }
    );

export type MenuActionGroup = {
    id: number;
    label: string;
    items: MenuAction[];
};

export type ActionsMenuRootProps = PropsWithChildren;

export type ActionsMenuTriggerProps = PropsWithChildren<
    { onclick: DropdownMenuTriggerProps['onclick']; },
    [{ props: Record<string, unknown>; }]
>;

export type ActionsMenuContentProps = PropsNoChildren<{
    groups: MenuActionGroup[];
    class?: string;
}> & Pick<DropdownMenuContentProps, 'align' | 'alignOffset' | 'side' | 'sideOffset'>;
