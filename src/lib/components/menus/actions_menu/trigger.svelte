<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import type { ActionsMenuTriggerProps } from "./impl.js";

  const { children, onclick }: ActionsMenuTriggerProps = $props();
</script>

<DropdownMenu.Trigger {onclick} child={children} />
