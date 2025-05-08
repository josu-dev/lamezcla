<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = {
    children: Snippet;
  } & HTMLButtonAttributes;

  let { children, class: classes, ...rest_props }: Props = $props();
</script>

<button
  {...rest_props}
  class="rounded-md bg-transparent focus-outline disabled:text-base-700 disabled:cursor-not-allowed not-disabled:hover:bg-accent [&>svg]:size-full {classes}"
>
  {@render children()}
</button>
