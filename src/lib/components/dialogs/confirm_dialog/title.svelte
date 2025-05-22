<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { ConfirmDialogTitleProps } from "./shared.svelte.js";

  const { children }: ConfirmDialogTitleProps = $props();
</script>

<Dialog.Title class="flex w-full items-center justify-center text-xl font-semibold tracking-tight" {children} />
