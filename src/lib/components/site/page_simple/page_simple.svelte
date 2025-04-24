<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();
</script>

<main class="flex flex-col h-page-content overflow-x-clip overflow-y-auto [scrollbar-gutter:stable] isolate">
  {@render children()}
</main>
