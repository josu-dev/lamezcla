<script lang="ts">
  import HumanTime from "$lib/components/HumanTime.svelte";
  import * as Model from "$lib/models/index.js";
  import type { Snippet } from "svelte";

  type Props = {
    header: {
      img?: Model.Image;
      title: string;
      updated_at: string;
    };
    content: {
      title: string;
      item_count: number;
    };
    children: Snippet;
  };

  let { header, content, children }: Props = $props();
</script>

<main class="flex flex-col h-site-content">
  <div class="border-b border-border flex gap-4 py-4 flex-none px-4">
    <div>
      <img
        src={header.img?.url}
        width={header.img?.width}
        height={header.img?.height}
        alt="{header.title} profile avatar"
        class="rounded-md shadow size-16 object-cover"
      />
    </div>
    <div>
      <h1 class="text-4xl font-bold">{header.title}</h1>
      <div class="text-sm font-semibold text-muted mt-1">
        Refreshed <HumanTime utc={header.updated_at} as_relative />
      </div>
    </div>
  </div>

  <div class="flex flex-col flex-1 overflow-x-clip overflow-y-auto">
    <div class="flex-none px-4 pt-4 pb-2 sticky top-0 z-10 bg-background/95">
      <h2 class="text-xl font-bold">{content.title} {content.item_count}</h2>
    </div>
    {@render children()}
  </div>
</main>
