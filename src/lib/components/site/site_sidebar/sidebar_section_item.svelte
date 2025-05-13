<script lang="ts" generics="Item extends Record<string, any>">
  import type { SidebarSectionItemProps } from "./internal.js";

  let {
    item,
    href = "#",
    left_icon,
    right_icon,
    title,
    subtitle,
    on_selected,
    is_selected = false,
    class: classes = "",
  }: SidebarSectionItemProps<Item> = $props();
</script>

<a
  {href}
  aria-current={is_selected ? "page" : undefined}
  data-selected={is_selected ? "" : undefined}
  {title}
  onclick={on_selected}
  class="block hover:bg-accent data-selected:bg-accent data-selected:hover:bg-muted/50 rounded-md group focus-outline {classes}"
>
  <div class="flex py-1 gap-x-1.5 items-center">
    <div class="rounded-md overflow-hidden p-0.5">
      {@render left_icon?.()}
    </div>
    <div class="flex flex-col flex-1 overflow-hidden" class:border-primary={is_selected}>
      <div class="font-semibold text-sm text-ellipsis text-nowrap overflow-hidden">
        {title}
      </div>
      {@render subtitle?.()}
    </div>
    <div class="mr-1 *:hidden group-hover:*:block group-focus-within:*:block">
      {@render right_icon?.()}
    </div>
  </div>
</a>
