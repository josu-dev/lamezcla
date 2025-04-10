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
  class="not-disabled:hover:bg-accent disabled:text-base-700 cursor-pointer rounded-md bg-transparent focus:ring-0 focus:outline-none disabled:cursor-not-allowed [&>svg]:size-full {classes}"
>
  {@render children()}
</button>
