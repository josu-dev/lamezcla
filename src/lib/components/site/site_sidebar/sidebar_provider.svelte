<script lang="ts">
  import type { SidebarProviderProps } from "./internal.js";
  import { use_site_sidebar_ctx } from "./sidebar.svelte.js";

  let { children, followed, pinned }: SidebarProviderProps = $props();

  use_site_sidebar_ctx({ followed, pinned });
</script>

{@render children()}
