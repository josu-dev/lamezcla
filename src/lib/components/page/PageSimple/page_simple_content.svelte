<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: Snippet;
    actions?: Snippet;
    subtitle?: Snippet;
    children: Snippet;
  };

  let { title, actions, subtitle, children }: Props = $props();
</script>

<div class="flex flex-col flex-1">
  <div class="flex-none px-4 py-4 sticky top-0 z-10 bg-background/95 border-b border-border">
    <div class="flex justify-between">
      <h2 class="text-xl font-bold">
        {@render title()}
      </h2>
      <div class="flex gap-x-2">
        {@render actions?.()}
      </div>
    </div>
    {#if subtitle}
      <div>
        {@render subtitle()}
      </div>
    {/if}
  </div>

  <div class="py-4">
    {@render children()}
  </div>
</div>
