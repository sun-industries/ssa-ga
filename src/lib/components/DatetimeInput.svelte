<script lang="ts">
  export let UTCFullYear = 0;
  export let UTCMonth = 0;
  export let UTCDay = 0;
  export let UTCHours = 0;
  export let UTCMinutes = 0;
  export let UTCSeconds = 0;
  export let disabled = false;
  export let dir:'row'|'col' = 'col'
  $: dirClass = dir == 'row' ? 
    'flex-row items-center h-7'
    : 'flex-col items-start'


  export function getDate(): Date {
    const date = new Date();
    date.setFullYear(UTCFullYear);
    date.setUTCMonth(UTCMonth - 1);
    date.setUTCDate(UTCDay);
    date.setUTCHours(UTCHours);
    date.setUTCMinutes(UTCMinutes);
    date.setUTCSeconds(UTCSeconds);
    return date;
  }
  
  export function setDate(date: Date) {
    UTCFullYear = date.getFullYear();
    UTCMonth = date.getUTCMonth() + 1;
    UTCDay = date.getUTCDate();
    UTCHours = date.getUTCHours();
    UTCMinutes = date.getUTCMinutes();
    UTCSeconds = date.getUTCSeconds();
  }
</script>

<div
  class="flex {dirClass}
bg-white bg-opacity-75 text-black px-2 py-1 select-none
  text-shadow-xl border {disabled ? 'border-transparent' : 'border-black'} 
  rounded-sm font-medium {$$restProps.class}"
>
  <div class="flex flex-row">
    <div class="w-[4ch] text-center">
      <input type="number" placeholder="YYYY" disabled={disabled} minlength="4" maxlength="4" class="w-full bg-transparent appearance-none text-right" bind:value={UTCFullYear} />
    </div>
    -
    <div class="w-[2ch] text-center">
      <input type="number" placeholder="MM" disabled={disabled} minlength="2" maxlength="2" class="w-full bg-transparent appearance-none text-right" bind:value={UTCMonth} />
    </div>
    -
    <div class="w-[2ch] text-center">
      <input type="number" placeholder="DD" disabled={disabled} minlength="2" maxlength="2" class="w-full bg-transparent appearance-none text-right" bind:value={UTCDay} />
    </div>
  </div>
  {#if dir == 'row'}
  <div class="w-2" />
  {/if}
  <div class="flex flex-row items-baseline">
    <div class="w-[2ch] text-center">
      <input type="number" placeholder="hh" disabled={disabled} minlength="2" maxlength="2" class="w-full bg-transparent appearance-none text-right" bind:value={UTCHours} />
    </div>
    :
    <div class="w-[2ch] text-center">
      <input type="number" placeholder="mm" disabled={disabled} minlength="2" maxlength="2" class="w-full bg-transparent appearance-none text-right" bind:value={UTCMinutes} />
    </div>
    :
    <div class="w-[2ch] text-center">
      <input type="number" placeholder="ss" disabled={disabled} minlength="2" maxlength="2" class="w-full bg-transparent appearance-none text-right" bind:value={UTCSeconds} />
    </div>
    <small class="ml-1 text-xs font-thin">UTC</small>
  </div>
</div>

<style>
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {
      display: none;
    }
</style>