<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { ConfirmDialogCancelProps } from "./shared.svelte.js";
  import { use_confirm_dialog_ctx } from "./shared.svelte.js";

  const { children, on_cancel }: ConfirmDialogCancelProps = $props();
  const ctx = use_confirm_dialog_ctx();
</script>

<Dialog.Close
  disabled={ctx.confirm_running}
  onclick={on_cancel}
  class="not-disabled:hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98] disabled:opacity-75"
  {children}
/>
