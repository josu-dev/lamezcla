<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import type { ActionsMenuRootProps } from "./impl.js";

  let { children }: ActionsMenuRootProps = $props();
</script>

<DropdownMenu.Root {children} />
