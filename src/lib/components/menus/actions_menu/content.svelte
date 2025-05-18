<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import type { ActionsMenuContentProps } from "./impl.js";

  const { groups, class: classes = "", ...restprops }: ActionsMenuContentProps = $props();
</script>

<DropdownMenu.Content
  {...restprops}
  class="border-border bg-accent w-full min-w-40 max-w-64 rounded-md border
      data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 {classes}"
>
  {#each groups as group (group.id)}
    <DropdownMenu.Group aria-label={group.label} class="py-2 not-last:border-b border-muted">
      {#each group.items as action (action.id)}
        <DropdownMenu.Item onSelect={action.onSelect}>
          {#snippet child({ props })}
            <svelte:element
              this={action.tag}
              {...action.props}
              {...props}
              class="data-highlighted:bg-muted flex w-full items-center text-sm font-medium px-2 cursor-pointer"
            >
              <div class="grid place-items-center size-8 mr-1.5">
                {#if action.icon_left}
                  {@const IconLeft = action.icon_left}
                  <IconLeft.Icon {...IconLeft.props} />
                {/if}
              </div>
              <div class="flex mr-1.5 leading-none">
                {action.label}
              </div>
            </svelte:element>
          {/snippet}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Group>
  {/each}
</DropdownMenu.Content>
