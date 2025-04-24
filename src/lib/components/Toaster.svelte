<script lang="ts" module>
  export { toast } from "svelte-french-toast";
  import { Toaster } from "svelte-french-toast";
</script>

<Toaster
  position="bottom-right"
  containerClassName="french-toast-container"
  toastOptions={{ className: "french-toast-message" }}
/>

<style lang="postcss">
  @reference "tailwindcss";

  :global {
    .french-toast-container div.french-toast-message {
      background-color: var(--color-background);
      color: var(--color-foreground);
      border-style: var(--tw-border-style);
      border-color: var(--color-neutral-500);
      border-radius: var(--radius);
      border-width: 1px;
      overflow-wrap: anywhere;
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
  }
</style>
