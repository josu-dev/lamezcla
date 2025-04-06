<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: Snippet;
    actions: Snippet;
    children: Snippet;
  };

  let { title, actions, children }: Props = $props();
</script>

<div class="flex flex-col flex-1 overflow-x-clip overflow-y-auto [scrollbar-gutter:stable] isolate">
  <div class="flex-none flex justify-between px-4 pt-4 pb-2 sticky top-0 z-10 bg-background/95">
    <h2 class="text-xl font-bold">
      {@render title()}
    </h2>
    <div class="flex gap-x-2">
      {@render actions()}
    </div>
  </div>
  {@render children()}
</div>
