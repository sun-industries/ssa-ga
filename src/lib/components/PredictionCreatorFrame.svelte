<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import DatetimeInput from "./DatetimeInput.svelte";
  import Frame from "./Frame.svelte";

  const MS_IN_H = 60 * 60 * 1000;

  const dispatch = createEventDispatcher();

  let fromInput;
  let toInput;
  let onStartAnalysis:Function = () => {};

  function startAnalysis(event) {
    event.preventDefault();
    const fromTime = fromInput.getDate();
    const toTime = toInput.getDate();
    dispatch('startAnalysis', {
      interval: [fromTime, toTime]
    });
  }

  onMount(() => {
    const now = new Date();
    fromInput.setDate(now)
    toInput.setDate(new Date(+now + 24 * MS_IN_H));
  });

  function fromNow() {
    fromInput.setDate(new Date());
  }

  function to1Day() {
    const fromDate = fromInput.getDate();
    toInput.setDate(new Date(+fromDate + 24 * MS_IN_H));
  }

  function to0_5Day() {
    const fromDate = fromInput.getDate();
    toInput.setDate(new Date(+fromDate + 12 * MS_IN_H));
  }

  function to3h() {
    const fromDate = fromInput.getDate();
    toInput.setDate(new Date(+fromDate + 3 * MS_IN_H));
  }

  function to1h() {
    const fromDate = fromInput.getDate();
    toInput.setDate(new Date(+fromDate + 1 * MS_IN_H));
  }

</script>

<Frame mode="top" class="w-[440px] left-[calc(50%-220px)]">
    <form class="mt-11 p-2 flex flex-col" on:submit={startAnalysis}>
      <div class="flex-1 flex flex-row">
        <div class="flex flex-col m-1">
          <span>From</span>
          <DatetimeInput bind:this={fromInput} dir='row' />
          <div class="mt-2 text-xs flex flex-row justify-start">
            <button type="button" class="bg-gray-300 px-1 rounded-md" on:click={fromNow}>Now</button>
          </div>
        </div>
        <div class="flex flex-col m-1">
          <span>To</span>
          <DatetimeInput bind:this={toInput} dir='row' />
          <div class="mt-2 text-xs flex flex-row justify-around">
            <button type="button" class="bg-gray-300 px-1 rounded-md" on:click={to1Day}>1 day</button>
            <button type="button" class="bg-gray-300 px-1 rounded-md" on:click={to0_5Day}>1/2 day</button>
            <button type="button" class="bg-gray-300 px-1 rounded-md" on:click={to3h}>3h</button>
            <button type="button" class="bg-gray-300 px-1 rounded-md" on:click={to1h}>1h</button>
          </div>
        </div>
      </div>
      <div class="flex justify-center mt-3">
        <button type="submit" class="bg-black text-white px-2 py-1 rounded-sm">
          Start Analysis
        </button>
      </div>
    </form>
</Frame>
