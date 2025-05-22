<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = {} & HTMLInputAttributes;
  let { class: classes, value = $bindable(), ...restprops }: Props = $props();
</script>

<input
  {...restprops}
  bind:value
  class="bg-background text-foreground rounded-md w-full border-border focus:ring-0 focus:border-foreground {classes}"
/>
