import type { RequestEvent } from '@sveltejs/kit';
import { createClient } from 'redis';

const client = createClient({
    url: 'redis://10.168.1.185:7777/3'
});

client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

export async function get(e: RequestEvent) {
    const key = e.params.id;
    const chartOptions = await client.get(key + "_with_quotes");
    if (!chartOptions) {
        return {
            status: 404,
        }
    }
    return {
        status: 200,
        body: JSON.parse(chartOptions)
    }
}