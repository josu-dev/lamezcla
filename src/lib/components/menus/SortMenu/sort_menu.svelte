<script lang="ts" generics="T">
  import { Icon } from "$lib/components/icons/index.js";
  import { DropdownMenu } from "bits-ui";
  import type { SortMenuProps } from "./types.js";

  let { current, modes, on_selected }: SortMenuProps<T> = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    onclick={(ev) => ev.stopPropagation()}
    class=" hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 text-base active:scale-[0.98]"
  >
    <Icon.ArrowDownUp class="" /><span class="">Sort</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    class="border-border prder-1 bg-accent w-full min-w-32 max-w-64 rounded-md border py-2
      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
    sideOffset={8}
    align="end"
    side="bottom"
  >
    {#each modes as mode (mode.id)}
      {@const is_current = mode.id === current.id}
      {@const Icon = mode.icon}
      <DropdownMenu.Item
        onSelect={(ev) => {
          on_selected(mode);
        }}
        class="rounded-button data-highlighted:bg-muted h-8 flex gap-x-2 items-center text-sm font-medium px-2 cursor-pointer data-current:bg-muted"
        data-current={is_current ? "" : undefined}
      >
        <div class="flex flex-col px-2">
          {mode.label}
        </div>
        {#if Icon}
          <div class="grid place-items-center ml-auto text-accent-foreground">
            <Icon class="" />
          </div>
        {/if}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
