<script lang="ts">
	import DataTable, { Head, Body, Row, Cell, Label, SortValue, Pagination } from '@smui/data-table';
	import Select, { Option } from '@smui/select';
	import type { Price } from '$lib/types';
	import IconButton from '@smui/icon-button';
	import LinearProgress from '@smui/linear-progress'

	export let rows: Price[] = [];
	export let loaded = false;

	let sort: keyof Price = 'bondCode';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let rowsPerPage = 10;
	let currentPage = 0;
	$: start = currentPage * rowsPerPage;
	$: end = Math.min(start + rowsPerPage, rows.length);
	$: lastPage = Math.max(Math.ceil(rows.length / rowsPerPage) - 1, 0);
	$: slice = rows.slice(start, end);
	$: if (currentPage > lastPage) {
		currentPage = lastPage;
	}

	function handleSort() {
		rows.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}
			return Number(aVal) - Number(bVal);
		});
		rows = rows;
	}
</script>

<DataTable
	sortable
	bind:sort
	bind:sortDirection
	on:SMUIDataTable:sorted={handleSort}
	style="max-width: 100%;"
>
	<Head>
		<Row>
			<Cell sortable columnId="bondCode">
				<Label>代码</Label>
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
			<Cell>名称</Cell>
			<Cell>理论价格</Cell>
			<Cell numeric>交易价格</Cell>
			<Cell sortable columnId="discount">
				<IconButton class="material-icons">arrow_upward</IconButton>
				<Label>折价率</Label>
			</Cell>
			<Cell numeirc sortable columnId="delta">
				<IconButton class="material-icons">arrow_upward</IconButton>
				<Label>Delta</Label>
			</Cell>
			<Cell numeric>Gamma</Cell>
		</Row>
	</Head>
	<Body>
		{#each slice as row (row.bondCode)}
			<Row>
				<Cell>{row.bondCode}</Cell>
				<Cell>{row.symbol}</Cell>
				<Cell numeric>{row.theoryValue.toFixed(2)}</Cell>
				<Cell numeric>{row.tradeValue.toFixed(2)}</Cell>
				<Cell numeric>{(row.discount * 100).toFixed(2)}</Cell>
				<Cell numeric>{(row.delta * 100).toFixed(2)}</Cell>
				<Cell numeric>{row.gamma.toFixed(2)}</Cell>
			</Row>
		{/each}
	</Body>
	<Pagination slot="paginate">
		<svelte:fragment slot="rowsPerPage">
			<Label>Rows Per Page</Label>
			<Select variant="outlined" bind:value={rowsPerPage} noLabel>
				<Option value={10}>10</Option>
				<Option value={25}>25</Option>
				<Option value={100}>100</Option>
			</Select>
		</svelte:fragment>
		<svelte:fragment slot="total">
			{start + 1}-{end} of {rows.length}
		</svelte:fragment>

		<IconButton
			class="material-icons"
			action="first-page"
			title="First page"
			on:click={() => (currentPage = 0)}
			disabled={currentPage === 0}>first_page</IconButton
		>
		<IconButton
			class="material-icons"
			action="prev-page"
			title="Prev page"
			on:click={() => currentPage--}
			disabled={currentPage === 0}>chevron_left</IconButton
		>
		<IconButton
			class="material-icons"
			action="next-page"
			title="Next page"
			on:click={() => currentPage++}
			disabled={currentPage === lastPage}>chevron_right</IconButton
		>
		<IconButton
			class="material-icons"
			action="last-page"
			title="Last page"
			on:click={() => (currentPage = lastPage)}
			disabled={currentPage === lastPage}>last_page</IconButton
		>
	</Pagination>
	<LinearProgress
		indeterminate
		bind:closed={loaded}
		aria-label="Data is being loaded..."
		slot="progress"
	/>
</DataTable>
