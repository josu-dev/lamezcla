<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = {
    label: string;
  } & HTMLInputAttributes;

  let { label, class: classes, ...restprops }: Props = $props();
  const id = $props.id();
</script>

<div class="flex items-center gap-2">
  <label for={id} class="cursor-pointer">
    <span class="sr-only">{label}</span>
    <Icon.Search />
  </label>
  <input
    {id}
    name={id}
    class="bg-background text-foreground w-full max-w-40 pb-0 px-1 pt-px border-t-transparent border-x-0 border-b border-t-0 border-border focus:ring-0 focus:border-muted {classes}"
    {...restprops}
  />
</div>
