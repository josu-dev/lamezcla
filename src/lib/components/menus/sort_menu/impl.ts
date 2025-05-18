import type { LucideComponent } from '@lucide/svelte';
import type { Component, ComponentProps } from 'svelte';

export type SortMode<T = unknown> = {
    id: string;
    label: string;
    compare_fn: (a: T, b: T) => number;
    icon?: Component;
    icon_props?: ComponentProps<typeof LucideComponent>;
};

export type SortMenuProps<T = unknown> = {
    current: SortMode<T>;
    modes: SortMode<T>[];
    on_selected: (value: SortMode<T>) => void;
};
