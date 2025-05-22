<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { ConfirmDialogDescriptionProps } from "./shared.svelte.js";

  const { children }: ConfirmDialogDescriptionProps = $props();
</script>

<Dialog.Description class="text-sm text-pretty pb-2" {children} />
