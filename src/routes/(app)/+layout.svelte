<script lang="ts">
  import { use_channel_ctx } from "$lib/client/state/channels.svelte.js";
  import { use_pinned_ctx } from "$lib/client/state/pinned.svelte.js";
  import * as Icon from "$lib/components/icons.js";
  import SiteSidebar from "$lib/components/SiteSidebar/SiteSidebar.svelte";
  import { type Snippet } from "svelte";
  import type { LayoutData } from "./$types.js";

  type Props = {
    data: LayoutData;
    children: Snippet;
  };

  let { data, children }: Props = $props();

  let cstate = use_channel_ctx(data.channels);
  let pstate = use_pinned_ctx(data.pinned);
</script>

<div class="flex flex-col h-full">
  <header class="flex h-14 flex-none px-4 border-b border-border">
    <div class="flex items-center">
      <a href="/" class="flex items-center text-3xl font-bold">
        <Icon.Shuffle class="block size-8 mb-0.5 mr-2" />
        <span>lamezcla</span>
      </a>
    </div>
    <div></div>
    <div></div>
  </header>

  <div class="flex">
    <SiteSidebar channels={cstate.channels} pinned={pstate.pinned} />

    <div class="flex-1">
      {@render children()}
    </div>
  </div>
</div>
