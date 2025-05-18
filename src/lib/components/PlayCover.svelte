<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";

  type Props = { size?: "sm" | "md" };

  const { size = "sm" }: Props = $props();

  const icon_class = {
    sm: "text-lg font-bold *:size-5 *:stroke-3",
    md: "text-2xl font-semibold *:size-7 *:stroke-[2.5]",
  };
</script>

<!-- [&:is(:where(.group):hover:not(:has([data-no-play]:hover,_[data-no-play]:focus))_*)]:opacity-100 -->
<div
  class="div absolute grid opacity-0 group-focus-visible:opacity-100 transition-opacity place-items-center inset-0 bg-background/75 rounded-md"
>
  <div class="flex items-center gap-2 {icon_class[size]}">
    <Icon.Play /> Play
  </div>
</div>

<style>
  :global .div:is(:where(.group):hover:not(:has([data-no-play]:hover, [data-no-play]:focus)) *) {
    opacity: 100%;
  }
</style>
