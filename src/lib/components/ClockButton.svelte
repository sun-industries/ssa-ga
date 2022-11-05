<script lang="ts">
  export let UTCFullYear = 0;
  export let UTCMonth = 0;
  export let UTCDay = 0;
  export let UTCHours = 0;
  export let UTCMinutes = 0;
  export let UTCSeconds = 0;
  export let editable = false;
</script>

<div
  class="fixed top-11 flex flex-col items-start
bg-white bg-opacity-75 text-black px-2 py-1 select-none
  text-shadow-xl border {editable ? 'border-black' : 'border-transparent'} rounded-sm font-medium"
>
  <div class="flex flex-row">
    <div class="w-[4ch] text-center">
      <input type="number" disabled={!editable} class="w-full bg-transparent appearance-none" value={UTCFullYear} />
    </div>
    -
    <div class="w-[2ch] text-center">
      <input type="number" disabled={!editable} class="w-full bg-transparent appearance-none" value={UTCMonth} />
    </div>
    -
    <div class="w-[2ch] text-center">
      <input type="number" disabled={!editable} class="w-full bg-transparent appearance-none" value={UTCDay} />
    </div>
  </div>
  <div class="flex flex-row">
    <div class="w-[2ch] text-center">
      <input type="number" disabled={!editable} class="w-full bg-transparent appearance-none" value={UTCHours} />
    </div>
    :
    <div class="w-[2ch] text-center">
      <input type="number" disabled={!editable} class="w-full bg-transparent appearance-none" value={UTCMinutes} />
    </div>
    :
    <div class="w-[2ch] text-center">
      <input type="number" disabled={!editable} class="w-full bg-transparent appearance-none" value={UTCSeconds} />
    </div>
  </div>
</div>

<style>
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {
      display: none;
    }
</style>