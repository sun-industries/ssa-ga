<script lang="ts">

    type Unit = 's/s'|'m/s'|'ms/s'|'h/s';

    let inputNode : HTMLInputElement;
    let inputType : 'text'|'number' = 'text';
    let pressed = false;
    let value = 1;
    export let valueSec = 1;
    let oldValue:number;
    let unit : Unit = 's/s'
    let valueFormatted = '+1';
    let oldValueFormatted = valueFormatted;
    $: unitShow = pressed ? 's/s' : unit
    function onPress() {
        pressed = true
        oldValue = value;
        inputNode.style.width = `${valueFormatted.length}ch`;
        inputType = 'number';
        oldValueFormatted = valueFormatted;
        valueFormatted = `${valueSec}`
        inputNode.focus();
        inputNode.select();
    }
    function onEnter() {
        pressed = false;
        //inputNode.blur();
        inputType = 'text';
        let inputValue = inputNode.value;
        if(inputValue.trim() === '') {
            applyFormat(valueSec)
        } else {
            let inputValueFloat = parseFloat(inputValue);
            if(Number.isNaN(inputValueFloat)) {
                applyFormat(valueSec);
            } else {
                valueSec = inputValueFloat
                applyFormat(valueSec)
            }
        }
        
        inputNode.style.width = `${valueFormatted.length}ch`;
    }

    function applyFormat(value:number) {
        if(value <= -3600. || value >= 3600.) {
            value /= 3600.
            unit = 'h/s'
        } else if(value <= -60. || value >= 60.) {
            value /= 60.
            unit = 'm/s'
        } else if(value <= -1. || value >= 1.) {
            unit = 's/s'
        } else {
            value *= 1000
            unit = 'ms/s'
        }
        valueFormatted = `${value >= 0 ? '+' : ''}${parseFloat(value.toFixed(2))}`
    }
    
</script>
<button on:click={onPress}
    class="flex flex-row  items-center bg-white bg-opacity-75 text-black px-2 py-1 mt-1 select-none
    text-shadow-xl border border-black rounded-tr-sm rounded-br-sm font-medium"
>
    <div class="flex flex-row items-baseline">
        <div class="min-w-3">
            <input placeholder={`${valueSec}`} bind:this={inputNode} on:change={onEnter} type={inputType} value={valueFormatted} 
            class="w-6 bg-transparent transition-all text-right outline-none">
        </div>
        <small class="ml-1">{unitShow}</small>
    </div>
</button>

<style>
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button {
      display: none;
    }
</style>