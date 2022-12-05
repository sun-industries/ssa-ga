<script lang="ts">
  import observatories from "../observatories";

  let selectedObsKey = 'Ckoirama'
  export let observatory;
  $: { observatory = observatories.find(obs => obs.name === selectedObsKey) }
</script>

<select on:change
  class="flex flex-row items-center
  bg-white bg-opacity-75 text-black px-2 py-1 ml-1 mt-1 select-none
    text-shadow-xl border border-black rounded-sm font-medium {$$restProps.class}"
    bind:value={selectedObsKey}
>
  {#each observatories as obs (obs.name)}
    <option value={obs.name}>{obs.name}</option>
  {/each}
</select>
