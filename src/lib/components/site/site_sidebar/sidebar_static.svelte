<script lang="ts">
  import type { SidebarStaticProps } from "./internal.js";
  import SidebarContent from "./sidebar_content.svelte";

  let {}: SidebarStaticProps = $props();
</script>

<aside class="w-64 border-r border-border flex min-h-site-content max-h-site-content flex-col flex-none">
  <h2 class="sr-only">Menu sections</h2>

  <SidebarContent />
</aside>
