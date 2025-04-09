<script lang="ts">
  import type * as Model from "$lib/models/index.js";
  import type { Snippet } from "svelte";

  type Props = {
    img?: Model.Image;
    alt: string;
    children?: Snippet<[Snippet]>;
  };

  const DEFAULT_IMG = {
    url: "https://i.ytimg.com/img/no_thumbnail.jpg",
    width: 120,
    height: 90,
  };

  let { img = DEFAULT_IMG, alt, children }: Props = $props();
</script>

{#snippet Image()}
  {@const is_16_9 = img.width / img.height === 16 / 9}
  <div class={is_16_9 ? "h-16 aspect-video" : "size-16"}>
    <img src={img.url} width={img.width} height={img.height} {alt} class="rounded-md object-cover size-full" />
  </div>
{/snippet}

<div class="flex-none">
  {#if children}
    {@render children(Image)}
  {:else}
    {@render Image()}
  {/if}
</div>
