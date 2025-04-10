<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = {
    children: Snippet;
    title: string;
    size?: "sm" | "md" | "lg";
  } & HTMLButtonAttributes;

  let { children, class: classes, size = "md", title, ...rest_props }: Props = $props();

  const size_class = {
    sm: "size-[1.75rem] p-1",
    md: "size-[2.375rem] p-1.5",
    lg: "size-9 p-1.5",
  };
</script>

<button
  {...rest_props}
  {title}
  class="not-disabled:hover:bg-accent 1 disabled:text-base-700 grid cursor-pointer place-items-center rounded-md bg-transparent focus:ring-0 focus:outline-none disabled:cursor-not-allowed [&>svg]:size-full {size_class[
    size
  ]} {classes}"
>
  <span class="sr-only">{title}</span>
  {@render children()}
</button>
