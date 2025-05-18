<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import * as SiteSidebar from "$lib/components/site/site_sidebar/index.js";
  import UserMenu from "./user_menu.svelte";
</script>

<header class="flex h-site-header px-2 border-b border-border z-10">
  <div class="flex items-center lg:hidden">
    <SiteSidebar.Mobile />
  </div>
  <div class="flex items-center">
    <a href="/" class="flex items-center text-3xl font-medium focus-outline rounded-md px-0.5 lg:px-2">
      <Icon.Shuffle class="hidden lg:block size-6 mr-2" />
      <span>lamezcla</span>
    </a>
  </div>
  <div class="flex items-center ml-auto">
    <UserMenu />
  </div>
</header>
