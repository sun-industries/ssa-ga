<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import type { SatTableRow, HistogramItem, Vector } from '../orbitalTypes';
    import { SatTicketStatus, satTicketStatusToColor } from "./../options";
    import PlotComponent from './PlotComponent.svelte';
    import * as Plot from "@observablehq/plot";
    import {zoom} from 'd3-zoom'
    import {select} from 'd3-selection';

    export let satTable:SatTableRow[] = [];
    export let histogram:HistogramItem[] = [];
    export let time;
    /*let options={
        marks:[Plot.dot(satTable, {
            x: 'starting',
            fill: "sunlitRatio"
        })],
        color: {
            scheme: 'viridis',
            type: 'linear',
            domain: [0, 1],
            //range: [0, 1]
        }
    }*/
    let k = 1;
    let x = 0;
    let y = 0;
    let width = 600;

    let showOverfly = true;
    let showSunlit = true;
    let showVisible = true;

    let plot;
    let pixelCoords;
    let chartCoords;

    let plotNode:Element;

    const dispatch = createEventDispatcher();

    function hexColor(color:number) {
        return '#' + color.toString(16);
    }

    function makeMarks(showOverfly, showSunlit, showVisible, time) {
        const marks = [];
        if(showOverfly) {
            marks.push(
                Plot.lineY(histogram, {
                    x: 'time',
                    y: 'overflyCount',
                    stroke: hexColor(satTicketStatusToColor(SatTicketStatus.OVERFLY)),
                    strokeWidth: 0.5,
                    curve: 'step-after'
                })
            );
        }
        if(showSunlit) {
            marks.push(
                Plot.lineY(histogram, {
                    x: 'time',
                    y: 'sunlitCount',
                    stroke: hexColor(satTicketStatusToColor(SatTicketStatus.SUNLIT)),
                    strokeWidth: 0.5,
                    curve: 'step-after'
                })
            );
        }
        if(showVisible) {
            marks.push(
                Plot.lineY(histogram, {
                    x: 'time',
                    y: 'visibleCount',
                    stroke: hexColor(satTicketStatusToColor(SatTicketStatus.VISIBLE)),
                    strokeWidth: 0.5,
                    curve: 'step-after'
                })
            );
        }
        /*if(chartCoords != null) {
            marks.push(Plot.ruleX([chartCoords.x], { stroke: "#88f" }));
            marks.push(Plot.ruleY([chartCoords.y], { stroke: "#88f" }));
        }*/
        marks.push(Plot.ruleY([0]));
        marks.push(Plot.ruleX([time], {stroke: "red"}));
        return marks;
    }

    $:options = {
        y: {
            grid: true,
            label: "↑ Quantity (u)",
        },
        x: {
           type: 'utc',
           label: "Time (UTC) →",
           range: [50 + x, width * k + x]
        },
        height: 200,
        width,
        marks: makeMarks(showOverfly, showSunlit, showVisible, time)
    }

    $:xScale = (plot && plot.scale('x')) || null;
    $:yScale = (plot && plot.scale('y')) || null;

    function handleMouseMove(e) {
            const bounds = plot.getBoundingClientRect();
            const x = Math.max(0, e.clientX - bounds.left);
            const y = Math.max(0, e.clientY - bounds.top);
            pixelCoords = { x: Math.floor(x), y: Math.floor(y) };

            if (pixelCoords == null || xScale == null || yScale == null) {
                chartCoords = null;
            } else {
                const _x = xScale.invert(pixelCoords.x);
                const _y = yScale.invert(pixelCoords.y);
                if(_y >= 0) {
                    chartCoords = { x: _x, y: _y };
                } else {
                    chartCoords = null;
                }
            }
    }
    function handleMouseLeave(e) {
        pixelCoords = null;
        chartCoords = null;
    }
    function handleMouseClick(e) {
        if(chartCoords != null) {
            time = chartCoords.x;
            dispatch('timechange', time);
        }
    }

    const theZoom = zoom().on('zoom', ({ transform }) => {
        //k = transform.k;
        //y = transform.y;
        console.log('transform', transform);
    });

    //function makeplot(node)
    $:{
        if(plotNode) {
            plot = Plot.plot(options);
            plotNode.innerHTML = '';
            plotNode.appendChild(plot);
            select(plot).call(theZoom);

            plot.addEventListener('mousemove', handleMouseMove);
            plot.addEventListener('mouseout', handleMouseLeave);
            plot.addEventListener('click', handleMouseClick);

            /*return {
                destroy() {
                    plot.removeEventListener('mousemove', handleMouseMove);
                    plot.removeEventListener('mouseout', handleMouseLeave);
                }
            }*/
        }
    }

    onMount(() => {
        function onResize () {
            width = window.innerWidth;
        }
        onResize();
        window.addEventListener('resize', onResize, true);
        return () => {
            window.removeEventListener('resize', onResize, true);
        }
    })
</script>

<div class="w-full {$$restProps.class}" style="width: {width}px;" >
    <input type="number" placeholder="X" bind:value={x} />
    <input type="number" placeholder="K" bind:value={k} />
    <input type="checkbox" bind:checked={showOverfly} />
    <input type="checkbox" bind:checked={showSunlit} />
    <input type="checkbox" bind:checked={showVisible} />
    <div bind:this={plotNode} />
    <!--<PlotComponent options={options} class="w-full" />-->
</div>