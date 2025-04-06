<script lang="ts">
  import type * as Model from "$lib/models/index.js";
  import type { Snippet } from "svelte";

  type Props = {
    img?: Model.Image;
    img_alt: string;
    title: Snippet;
    children?: Snippet;
    actions: Snippet;
  };

  let { img, img_alt, title, children, actions }: Props = $props();
</script>

<header class="border-b border-border flex gap-4 py-4 flex-none px-4">
  <div>
    <img
      src={img?.url}
      width={img?.width}
      height={img?.height}
      alt={img_alt}
      class="rounded-md shadow size-16 object-cover"
    />
  </div>
  <div>
    <h1 class="text-4xl font-bold">
      {@render title()}
    </h1>
    <div class="text-sm font-semibold text-muted mt-1">
      {@render children?.()}
    </div>
  </div>
  <div class="ml-auto self-center">
    {@render actions()}
  </div>
</header>
