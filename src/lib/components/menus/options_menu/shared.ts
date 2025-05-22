import type { MenuAction } from '$lib/components/menus/actions_menu/index.js';


export type MenuOption = {
    label: string;
    icon_left: MenuAction["icon_left"] & {};
    disabled?: boolean;
} & (
        { onSelect: MenuAction["onSelect"] & {}; } |
        { href: string; onSelect?: MenuAction["onSelect"] & {}; }
    );
