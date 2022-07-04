<script lang="ts">
	import axios from 'axios';
	import type { Cashflow } from '$lib/types';
	import { onMount } from 'svelte';
	import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
	import moment from 'moment';
	import Select, { Option } from '@smui/select';
	import { derived, writable} from 'svelte/store';
	import Textfield from '@smui/textfield';
	import Button from '@smui/button';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import IconButton, { Icon } from '@smui/icon-button';
	import { numberWithCommas } from '$lib/util';
	import { slimscroll } from 'svelte-slimscroll';
	import Card from '@smui/card';
	import Plot from '../../components/plot.svelte';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';

	let rows: Cashflow[] = [];
	let loaded = true;
	let strategies = ['CBOND_FUT', 'CBOND_FUT_HF'];
	let accounts: string[] = [];
	let strategy = writable(strategies[0]);
	let account = writable('account');
	let side = '';
	let option = derived([strategy, account], ($values) => {
		return { strategy: $values[0], account: $values[1] };
	});
	let cashAmount = 0;
	let plotKey = 'z';
	let isAdmin = false;

	async function refresh(o: any) {
		const base = '/api/cash';
		const params = new URLSearchParams();
		if (o.strategy) {
			params.set('strategy', o.strategy);
		}
		if (o.account) {
			params.set('account', o.account);
		}
		// somehow ugly, but works
		const u = base + '?' + params.toString();
		const {data} = await axios.get(u);
		rows = data as Cashflow[];
	}

	async function fetchAccounts() {
		const { data } = await axios.get('/api/accounts');
		accounts = data.accounts.sort();
	}

	onMount(() => {
		option.subscribe(refresh);
		fetchAccounts();
	});

	function accountNumber(n: number) {
		n = Math.round(n);
		if (n > 0) {
			return numberWithCommas(n);
		} else {
			n = -n;
			return `(${numberWithCommas(n)})`;
		}
	}

	function submitCashIO(cash: number) {
		if ($strategy && $account) {
			const item: Cashflow = {
				strategy: $strategy,
				fundAccount: $account,
				fundFlow: cash,
				t: new Date(new Date().toDateString())
			};
			axios.post('/api/cash', item).then((res) => {
				toast.push(`提交成功! affect ${res.data.affected}行, id ${res.data.insertedId}`);
				// refresh again
				refresh($option);
			});
		} else {
			alert('设置出入金账户和策略');
		}
	}
</script>

<svelte:head>
	<title>出入金</title>
</svelte:head>
<div class="container">
	<Card style="display: flex; flex-direction: row">
		<div class="option">
			<Select bind:value={plotKey} label="收益分拆">
				<Option value={'y'}>ETF</Option>
				<Option value={'z'}>策略</Option>
			</Select>
			<Select bind:value={$strategy} label="策略">
				{#each strategies as strategy}
					<Option value={strategy}>{strategy}</Option>
				{/each}
			</Select>

			<Select bind:value={$account} label="账户">
				<Option value={''}>无</Option>
				{#each accounts as account}
					<Option value={account}>{account}</Option>
				{/each}
			</Select>
			<Textfield type="number" label="出入金额" bind:value={cashAmount} />

			<Select bind:value={side} label="方向">
				<Option value={''}>无</Option>
				<Option value={'in'}>入金</Option>
				<Option value={'out'}>出金</Option>
			</Select>

			<!-- FormField here is helpful to keep checkbox and label text on the same line -->
			<FormField>
				<Checkbox bind:checked={isAdmin} />
				<span slot="label">交易权限</span>
			</FormField>

			<div style="display: flex; flex-direction: row">
				<Button
					disabled={!isAdmin}
					style="flex: 1; margin: 3px"
					on:click={() => {
						submitCashIO(Math.abs(cashAmount));
					}}
					variant="raised">入金</Button
				>
				<Button
					disabled={!isAdmin}
					style="flex: 1; margin: 3px"
					on:click={() => {
						submitCashIO(-Math.abs(cashAmount));
					}}
					variant="raised">出金</Button
				>
			</div>
		</div>
		<Plot key={plotKey} width="100%" height="400px" />
	</Card>

	<div class="table">
		<div class="toolbar">
			<IconButton
				on:click={() => refresh($option).then(() => {toast.push('刷新完成')})}
				class="material-icons">refresh</IconButton
			>
			<div style="display: flex; flex: 1; align-items: center">
				<Icon class="material-icons">attach_money</Icon>
				<span style="margin-right: 15px">
					{accountNumber(rows.reduce((a, n) => a + n.fundFlow, 0))}
				</span>
				<Icon class="material-icons">add</Icon>
				<span style="margin-right: 15px;color: #55cc55">
					{accountNumber(rows.filter((n) => n.fundFlow > 0).reduce((a, n) => a + n.fundFlow, 0))}
				</span>
				<Icon class="material-icons">remove</Icon>
				<span style=";color: pink">
					{accountNumber(rows.filter((n) => n.fundFlow < 0).reduce((a, n) => a + n.fundFlow, 0))}
				</span>
			</div>
		</div>
		<div class="table-container" use:slimscroll={{ height: '800px', alwaysVisible: true }}>
			<DataTable sortable stickyHeader style="width: 100%">
				<Head>
					<Row>
						<Cell>日期</Cell>
						<Cell>策略</Cell>
						<Cell>账户</Cell>
						<Cell style="width: 100%;">金额</Cell>
					</Row>
				</Head>
				<Body>
					{#each rows as row (row.id)}
						{#if (side === 'in' && row.fundFlow > 0) || (side === 'out' && row.fundFlow < 0) || side === ''}
							<Row style={'background-color: ' + (row.fundFlow > 0 ? 'pink' : '#55cc55')}>
								<Cell>{moment(row.t).format('YYYY-MM-DD')}</Cell>
								<Cell>{row.strategy}</Cell>
								<Cell>{row.fundAccount}</Cell>
								<Cell>{accountNumber(Math.round(row.fundFlow))}</Cell>
							</Row>
						{/if}
					{/each}
				</Body>
				<LinearProgress
					indeterminate
					bind:closed={loaded}
					aria-label="Data is being loaded..."
					slot="progress"
				/>
			</DataTable>
		</div>
	</div>
</div>
<SvelteToast />

<style>
	.toolbar {
		display: flex;
		align-items: center;
	}

	.container {
		margin: 0 50px;
	}

	.table-container {
		overflow-y: scroll;
	}

	.option {
		display: flex;
		flex-direction: column;
		width: 200px;
		margin: 20px 10px;
	}
</style>
