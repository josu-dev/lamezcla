<script lang="ts">
  import { base } from "$app/paths";
  import { Icon } from "$lib/components/icons/index.js";
  import * as SiteSidebar from "$lib/components/site/site_sidebar/index.js";
  import * as SiteSearch from "$lib/components/site/site_search/index.js";
  import { SITE_NAME } from "$lib/constants.js";
  import UserMenu from "./user_menu.svelte";

  function resolve_path(path: string) {
    return `${base}${path}`;
  }
</script>

<header class="relative flex h-site-header px-2 border-b border-border z-10">
  <div class="flex items-center lg:hidden">
    <SiteSidebar.Mobile />
  </div>
  <div class="flex items-center">
    <a href={resolve_path("/")} class="flex items-center text-3xl font-medium focus-outline rounded-md px-0.5 lg:px-2">
      <Icon.Shuffle class="hidden lg:block size-6 mr-2" />
      <span>{SITE_NAME}</span>
    </a>
  </div>
  <SiteSearch.Inline />
  <div class="flex items-center ml-auto gap-1">
    <SiteSearch.Mobile />
    <UserMenu />
  </div>
</header>
