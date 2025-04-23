<script lang="ts">
  import type { SidebarSectionProps } from "./internal.js";

  let { title, children, class: classes = "" }: SidebarSectionProps = $props();
</script>

<section class="not-last:border-b border-border py-4 px-2 {classes}">
  {#if title === undefined}
    {@render children()}
  {:else}
    <div class="px-2">
      <h3 class="font-bold text-lg">{title}</h3>
    </div>
    <ul class="mt-2">
      {@render children()}
    </ul>
  {/if}
</section>
