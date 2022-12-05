<script lang="ts">
    export let mode:'top'|'down' = 'down';
    $: modeClass = mode == 'top' ? 
    'top-0 rounded-b-lg'
    : 'down-0 rounded-t-lg'
</script>

<div class="bg-white bg-opacity-60 border fixed overflow-hidden drop {modeClass} {$$restProps.class}">
    <slot></slot>
</div>

<style>
    .drop {
        backdrop-filter: blur(10px);
    }
</style>