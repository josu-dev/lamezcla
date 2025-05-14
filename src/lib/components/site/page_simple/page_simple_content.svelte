<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: Snippet;
    actions?: Snippet;
    children: Snippet;
  };

  let { title, actions, children }: Props = $props();
</script>

<div class="flex flex-col flex-1">
  <div class="flex-none px-4 py-2 sm:py-4 sticky top-0 z-10 bg-background/95 border-b border-border">
    <div class="flex flex-col-reverse gap-2 justify-between sm:flex-row">
      <h2 class="text-xl font-bold flex-1 flex">
        {@render title()}
      </h2>
      <div class="flex gap-x-2 flex-wrap">
        {@render actions?.()}
      </div>
    </div>
  </div>

  <div class="py-4">
    {@render children()}
  </div>
</div>
