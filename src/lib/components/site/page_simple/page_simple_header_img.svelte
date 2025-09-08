<script lang="ts">
  import type { Model } from "$data/models/index.js";

  import type { Snippet } from "svelte";

  type Props = {
    img?: Model.Image;
    square?: boolean;
    alt: string;
    children?: Snippet<[Snippet]>;
  };

  const DEFAULT_IMG = {
    url: "https://i.ytimg.com/img/no_thumbnail.jpg",
    width: 120,
    height: 90,
  };

  let { img = DEFAULT_IMG, square = false, alt, children }: Props = $props();
</script>

{#snippet Image()}
  <div
    data-square={square ? "" : undefined}
    class="h-28 aspect-video rounded-md overflow-hidden data-square:size-28 data-square:aspect-auto"
  >
    <img src={img.url} width={img.width} height={img.height} {alt} class="object-cover size-full" />
  </div>
{/snippet}

{#if children}
  {@render children(Image)}
{:else}
  {@render Image()}
{/if}
