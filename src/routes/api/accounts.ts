import axios from 'axios';
import 'dotenv/config'

export async function get() {
    let response = await axios.get(process.env.BACKEND + "/api/accounts")
    return {
        status: 200,
        body: response.data,
    }
}