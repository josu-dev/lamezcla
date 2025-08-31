<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
    el?: null | HTMLElement;
  };

  let { children, el = $bindable(null) }: Props = $props();
</script>

<main
  bind:this={el}
  class="flex flex-col h-page-content overflow-x-clip overflow-y-auto [scrollbar-gutter:stable] isolate"
>
  {@render children()}
</main>
