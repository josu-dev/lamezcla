<script lang="ts">
  import type { ConfirmDialogActionsProps } from "./shared.svelte.js";

  const { confirm, actions }: ConfirmDialogActionsProps = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="text-sm text-center">
    {@render confirm()}
  </div>
  <div class="flex justify-center gap-4 sm:gap-6 text-base">
    {@render actions()}
  </div>
</div>
