<!-- App.svelte -->
<script>
	import { Router, Link, Route } from "svelte-navigator";
	import Cash from "./cash/index.svelte";
	import Rank from "./rank/index.svelte";

	// Used for SSR. A falsy value is ignored by the Router.
	export let url = "";
</script>

<Router {url}>
	<nav>
		<Link to="/">Home</Link>
		<Link to="cash">Cash</Link>
		<Link to="rank">Rank</Link>
	</nav>
	<div>
		<Route path="/">
			Welcome to CB admin system.
		</Route>
		<Route path="cash" component={Cash} />
		<Route path="rank" component={Rank}></Route>
	</div>
</Router>
