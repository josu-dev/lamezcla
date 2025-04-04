<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    children: Snippet;
  };

  let { title, children }: Props = $props();
</script>

<section class="border-b border-border py-4 px-2">
  <div class="px-2">
    <h3 class="font-bold text-lg">{title}</h3>
  </div>
  <ul class="mt-2">
    {@render children()}
  </ul>
</section>
