<script lang="ts" module>
  import { Toaster } from "svelte-french-toast";
  import "./toaster.css";

  export { toast } from "svelte-french-toast";
</script>

<Toaster
  position="top-center"
  containerClassName="french-toast-container"
  toastOptions={{ className: "french-toast-message" }}
/>
