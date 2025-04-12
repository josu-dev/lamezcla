<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    image?: Snippet;
    title: Snippet;
    children?: Snippet;
    actions: Snippet;
  };

  let { image, title, children, actions }: Props = $props();
</script>

<header class="border-b border-border flex gap-4 py-4 flex-none px-4">
  <div class="flex-none">
    {@render image?.()}
  </div>
  <div>
    <h1 class="text-4xl font-bold line-clamp-2">
      {@render title()}
    </h1>
    <div class="text-sm font-semibold text-muted mt-1 space-y-0.5">
      {@render children?.()}
    </div>
  </div>
  <div class="ml-auto self-center">
    {@render actions()}
  </div>
</header>
