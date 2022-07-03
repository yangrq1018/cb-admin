<script lang="ts">
	import { asPercentage } from '$lib/util';

	import { toast } from '@zerodevx/svelte-toast';
	import axios, { AxiosError } from 'axios';
	import { init } from 'echarts';
	import { onMount } from 'svelte';
	export let key = 'z';
	export let width = '100%';
	export let height = '800px';
	import * as echarts from 'echarts';
	let canvas: HTMLElement;

	const render = async (key: string) => {
		if (!canvas) {
			return;
		}
		const mychart = init(canvas);
		try {
			const { data } = await axios.get('/api/chart/' + key);
			// dumb cast here
			(data.yAxis as any)[0].axisLabel.formatter = function (params: number, index: number) {
				return (params * 100).toFixed() + '%';
			};

			// tweak echarts option here
			data.title = data.title.slice(0, 0);

			data.series.forEach(({}, i: number) => {
				data.series[i].showSymbol = false;
			});

			data.tooltip.axisPointer.label = {
				formatter: (params: any) => {
					if (params.axisDimension === 'y') {
						return asPercentage(params.value);
					} else {
						return echarts.time.format(params.value, '{yyyy}-{MM}-{dd}', false);
					}
				}
			};

			// "float: right" to align the values uniformly to the right border of box
			data.tooltip.formatter = (params: any) => {
				let rows = params.map((x: any) => {
					return x.marker + `<span>${x.seriesName} &nbsp <span style="float: right">${asPercentage(x.data[1])}</span></span>`;
				});
				return params[0].data[0] + '<br>' + rows.join('<br>');
			};

			data.yAxis[0].splitLine.show = true

			if (key === 'z') {
				const selected = data.legend[0].selected;
				Object.keys(selected).forEach((k) => (selected[k] = false));
				selected['多空'] = true;
				selected['多头'] = true;
			}

			mychart.setOption(data);
		} catch (error) {
			const e = error as AxiosError;
			toast.push('Failed to retrive plot ' + e.code!);
		}
	};

	// trigger update (via function) when key prop value changed
	$: render(key);

	onMount(async () => {
		render(key);
	});
</script>

<div id="canvas" bind:this={canvas} style="height:{height};width:{width}" />
