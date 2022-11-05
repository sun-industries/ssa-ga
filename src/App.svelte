<script lang="ts">
  import Globe from "./lib/Globe.svelte";
  import { onMount } from "svelte";
  import { Modes, SGP4States } from "./lib/options";
  import observatories from "./lib/observatories";

  import OrbitalWorker from "./lib/orbital.worker?worker";
  import TimeButton from "./lib/components/TimeButton.svelte";
  import ClockButton from "./lib/components/ClockButton.svelte";
  import ObservatorySelector from "./lib/components/ObservatorySelector.svelte";

  const CELESTRACK_URL = `https://cors-noproblem.herokuapp.com/https://www.celestrak.com/norad/elements/active.txt`;

  let time = new Date();
  let globeComponent: Globe;
  let syncWorker: Worker;

  let UTCFullYear = 0;
  let UTCMonth = 0;
  let UTCDay = 0;
  let UTCHours = 0;
  let UTCMinutes = 0;
  let UTCSeconds = 0;
  let satTable = [];
  let satData = [];
  let satDataLastSize = 0;
  let observatory = observatories[1]

  let mode = Modes.PLAY;
  let SGP4State: SGP4States = SGP4States.OFF;

  let secondsInSecond = 1;
  $: factor = calculateFactor(secondsInSecond);

  function calculateFactor(secondsInSecond) {
    let factor = secondsInSecond / 60;
    if(secondsInSecond >= 0 && secondsInSecond < 1) {
      factor = 1;
    } else if(secondsInSecond > 0 && secondsInSecond > 60) {
      factor = 4;
    } else {
      factor = 1 + Math.sqrt((9/3490) * Math.pow(secondsInSecond - 1, 2) / (1 - 9/3490));
    }
    return factor
  }

  function onPlayStop() {
    if (mode === Modes.PAUSED) {
      mode = Modes.PLAY;
      updatePoints();
    } else if (mode === Modes.PLAY) {
      mode = Modes.PAUSED;
    }
  }

  function updatePoints() {
      if(mode !== Modes.PLAY) {
        return;
      }
      syncWorker.postMessage({
        type: 'tick',
        time: new Date(+time + (secondsInSecond * 1000 / factor) )
      });
      console.log('factor', factor)
      setTimeout(updatePoints, 1000 / factor);
  };

  onMount(async () => {
    //const SyncWorker = await import('./assets/orbital.worker?worker');
    //syncWorker = new SyncWorker.default();

    syncWorker = new OrbitalWorker();

    syncWorker.postMessage({
      type: "domMounted",
    });

    fetch(CELESTRACK_URL)
      .then((r) => r.text())
      .then((tleTxt) => {
        syncWorker.postMessage({
          type: "init",
          tleTxt,
        });
      });

    syncWorker.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const data = new Float32Array(event.data);
        const size = (data.length - 6) / 4;
        let cursor = 0;
        UTCFullYear = data[cursor++];
        UTCMonth = data[cursor++];
        UTCDay = data[cursor++];
        UTCHours = data[cursor++];
        UTCMinutes = data[cursor++];
        UTCSeconds = data[cursor++];

        time.setUTCFullYear(UTCFullYear);
        time.setUTCMonth(UTCMonth);
        time.setUTCDate(UTCDay);
        time.setUTCHours(UTCHours);
        time.setUTCMinutes(UTCMinutes);
        time.setUTCSeconds(UTCSeconds);
        time.setUTCMilliseconds(0);

        let i = 0,
          j = 0;
        let colorIndex;

        while (i++ < size) {
          colorIndex = data[cursor++];
          if (colorIndex < 0) {
            // error, so skyp sat data
            cursor += 3;
          } else {
            satData[j++] = {
              name: `sat${j}`,
              color: "red", //COLORS[colorIndex], //({1: 'blue', 2: 'red', 10: 'green', 11: 'yellow'})[colorIndex], // 1: Starlink, 2: OneWeb
              lat: data[cursor++],
              lng: data[cursor++],
              alt: data[cursor++],
              type: "sat",
            };
          }
        }
        if (i !== j) {
          // Here we remove the empty spaces carring from the error
          // (where the cursor is += 3)
          satData.splice(-(i - j), size);
        }
        if (satDataLastSize > size) {
          satData.splice(size, satDataLastSize);
        }
        satDataLastSize = size;

        //globeComponent.customLayerData(satData);
        satData.push({
          lat: data[cursor++],
          lng: data[cursor++],
          alt: data[cursor++],
        });

        // todo: hack to push observatory symbol
        let _observatory = Object.assign({}, observatory);
        _observatory.type = "obs";
        _observatory.alt = _observatory.alt / 6378.137;
        satData.push(_observatory);

        globeComponent.update(satData);

        /*requestAnimationFrame(() => {
          syncWorker.postMessage({
            type: "tick",
            time: new Date(+time + 10000),
          });
        });*/
      } else if(event.data.type === 'SGP4StateChange') {
        SGP4State = event.data.newState
        /*if(event.data.newState === SGP4States.INITIATED) {
          syncWorker.postMessage({
            type: "tick",
            time
          });
        }*/
        updatePoints()
      }
    };

    (function drawExtern() {
      globeComponent.draw(time);
      requestAnimationFrame(drawExtern);
    })();
  });
</script>

<div
  class="fixed top-0 left-0 right-0 
flex flex-row items-center"
>
  <button
    on:click={onPlayStop}
    class="material-symbols-rounded 
  bg-white bg-opacity-75 text-black p-1 mt-1 ml-1 select-none
  text-shadow-xl border border-black rounded-tl-sm rounded-bl-sm border-r-0 font-medium"
  >
    {#if mode === Modes.PLAY}
      pause
    {:else if mode === Modes.PAUSED}
      play_arrow
    {/if}
  </button>
  <TimeButton bind:valueSec={secondsInSecond} />
  <span class="flex-grow" />
  <ObservatorySelector bind:observatory />
  <span class="flex-grow" />
  <button
    class="flex flex-row  items-center bg-white bg-opacity-75 text-black px-2 py-1 mt-1 mr-1 select-none
  text-shadow-xl border border-black rounded-sm font-medium"
  >
    <span class="material-symbols-rounded">tune</span>
  </button>
</div>

<button
  class="fixed top-11 right-1 flex flex-row  items-center bg-white bg-opacity-75 text-black px-2 py-1 select-none
  text-shadow-xl border border-black rounded-sm font-medium"
>
  <span class="material-symbols-rounded">question_mark</span>
</button>
<button
  class="fixed top-20 right-1 flex flex-row  items-center bg-gray-400 bg-opacity-75 text-black px-2 py-1 select-none
  text-shadow-xl border border-black rounded-sm font-medium"
>
  <span class="material-symbols-rounded">pan_tool</span>
</button>

<ClockButton 
  bind:UTCFullYear
  bind:UTCMonth
  bind:UTCDay
  bind:UTCHours
  bind:UTCMinutes
  bind:UTCSeconds
  editable={mode === Modes.PAUSED}
/>

<Globe bind:this={globeComponent} />

<div
  class="fixed bottom-0 left-0 right-0 
flex flex-row items-center"
>
  <span class="flex-grow" />
  <button
    class="flex flex-row  items-center bg-white bg-opacity-75 text-black px-2 py-1 mb-1 ml-1 select-none
  text-shadow-xl border border-black rounded-sm font-medium"
  >
    <span class="material-symbols-rounded">satellite_alt</span>
    <span class="ml-1"> Create Prediction </span>
  </button>
  <span class="flex-grow" />
</div>