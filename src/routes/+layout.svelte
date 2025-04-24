<script lang="ts">
  import Toaster from "$lib/components/Toaster.svelte";
  import "../app.css";

  let { children } = $props();
</script>

<Toaster />

{@render children()}
