<script lang="ts" generics="Item extends Record<string, any>">
  import type { Snippet } from "svelte";

  type Props = {
    href?: string;
    item?: Item;
    left_icon?: Snippet;
    title: string;
    subtitle?: Snippet;
    is_selected?: boolean;
    on_selected?: (ev: MouseEvent) => void;
    class?: string;
  };

  let {
    item,
    href = "#main",
    left_icon,
    title,
    subtitle,
    on_selected,
    is_selected = false,
    class: classes = "",
  }: Props = $props();
</script>

<li>
  <a
    {href}
    aria-current={is_selected ? "page" : undefined}
    data-selected={is_selected ? "" : undefined}
    class="block hover:bg-accent data-selected:bg-accent data-selected:hover:bg-muted/50 rounded-md group {classes}"
    onclick={on_selected}
  >
    <div class="flex py-1 pl-0.5 pr-1.5 gap-1.5 items-center">
      <div class="rounded-md overflow-hidden p-0.5">
        {@render left_icon?.()}
      </div>
      <div class="flex flex-col flex-1 overflow-hidden" class:border-primary={is_selected}>
        <div class="font-semibold text-sm text-ellipsis text-nowrap overflow-hidden">
          {title}
        </div>
        {@render subtitle?.()}
      </div>
    </div>
  </a>
</li>
