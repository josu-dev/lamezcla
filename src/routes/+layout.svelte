<script lang="ts">
  import { dev } from "$app/environment";
  import Toaster from "$lib/components/Toaster.svelte";
  import "../app.css";

  let { children } = $props();

  if (dev) {
    $effect(() => {
      let cleanup = () => {};
      import("eruda").then((m) => {
        m.default.init();
        m.default.position({ x: window.innerWidth, y: window.innerHeight });
        cleanup = m.default.destroy;
      });
      return () => cleanup();
    });
  }
</script>

<Toaster />

{@render children()}
