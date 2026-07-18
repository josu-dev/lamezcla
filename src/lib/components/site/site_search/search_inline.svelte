<script lang="ts">
  import SearchForm from "./search_form.svelte";
</script>

<div class="absolute left-1/2 top-1/2 hidden w-[min(30rem,42vw)] -translate-x-1/2 -translate-y-1/2 lg:block">
  <SearchForm input_id="header-search" class="w-full" show_focus_icon />
</div>
