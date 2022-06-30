<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	import axios, { AxiosError } from 'axios';
	import { init } from 'echarts';
	import { onMount } from 'svelte';
	export let key = 'z';
	export let width = '100%';
	export let height = '800px';
	let canvas: HTMLElement;

	const render = async (key: string) => {
		const mychart = init(canvas);
		try {
			const { data } = await axios.get('/api/chart/' + key);
			// dumb cast here
			(data.yAxis as any)[0].axisLabel.formatter = function (params: number, index: number) {
				return (params * 100).toFixed() + '%';
			};
			mychart.setOption(data);
		} catch (error) {
			const e = error as AxiosError;
			toast.push('Failed to retrive plot ' + e.code!);
		}
	}

	// trigger update (via function) when key prop value changed
	$: render(key)

	onMount(async () => {render(key)});
</script>

<div id="canvas" bind:this={canvas} style="height:{height};width:{width}" />
