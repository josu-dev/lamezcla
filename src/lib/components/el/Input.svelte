<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = {} & HTMLInputAttributes;
  let { class: classes, ...restprops }: Props = $props();
</script>

<input
  {...restprops}
  class="bg-background text-foreground rounded-md w-full border-border focus:ring-0 focus:border-muted {classes}"
/>
