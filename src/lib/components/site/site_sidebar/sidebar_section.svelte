<script lang="ts">
  import type { SidebarSectionProps } from "./internal.js";

  let { title, children, class: classes = "" }: SidebarSectionProps = $props();
</script>

<section class="not-last:border-b border-border py-4 px-2 {classes}">
  {#if title === undefined}
    {@render children()}
  {:else}
    <div class="px-1.5">
      <h3 class="font-bold text-lg">{title}</h3>
    </div>
    {@render children()}
  {/if}
</section>
