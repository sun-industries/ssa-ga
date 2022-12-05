<script>
    import * as Plot from "@observablehq/plot";
    import {zoom} from 'd3-zoom'
    
    export let options;

    function myplot(node) {
        node.appendChild(
            Plot.plot(options)
        )
    }
</script>

{#key options}
	<div use:myplot {...$$restProps}></div>
{/key}