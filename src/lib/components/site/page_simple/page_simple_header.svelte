<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    image?: Snippet;
    title: Snippet;
    children?: Snippet;
    actions?: Snippet;
  };

  let { image, title, children, actions }: Props = $props();
</script>

<header
  class="grid [grid-template-areas:'img_actions''title_title'] grid-cols-2 border-b border-border gap-y-4 gap-x-4 py-4 flex-none px-4 md:[grid-template-areas:'img_title_actions'] md:grid-cols-[auto_1fr_auto]"
>
  <div class="[grid-area:img]">
    {@render image?.()}
  </div>
  <div class="[grid-area:title]">
    <h1 class="text-3xl font-bold line-clamp-2">
      {@render title()}
    </h1>
    <div class="text-sm font-semibold text-muted mt-0.5 space-y-0.5">
      {@render children?.()}
    </div>
  </div>
  <div class="[grid-area:actions] ml-auto self-center">
    {@render actions?.()}
  </div>
</header>
