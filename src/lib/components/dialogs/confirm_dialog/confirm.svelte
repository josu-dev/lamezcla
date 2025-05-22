<script lang="ts">
  import type { ConfirmDialogConfirmProps } from "./shared.svelte.js";
  import { use_confirm_dialog_ctx } from "./shared.svelte.js";

  const { children, on_confirm }: ConfirmDialogConfirmProps = $props();
  const ctx = use_confirm_dialog_ctx();

  async function _on_confirm() {
    if (ctx.confirm_running) return;
    ctx.confirm_running = true;

    await Promise.resolve(on_confirm()).finally(() => ctx.set_confirm_running(false));
    ctx.set_open(false);
  }
</script>

<button onclick={_on_confirm} class="hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98]">
  {@render children(ctx.confirm_running)}
</button>
