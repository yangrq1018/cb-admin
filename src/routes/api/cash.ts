import mysql from 'mysql2/promise';
import type {ResultSetHeader} from 'mysql2'
import {
    StatusCodes,
} from 'http-status-codes';
import type { Cashflow } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import moment from 'moment'


async function createConn() {
    const conn = await mysql.createConnection({
        host: '10.168.1.185',
        user: 'test',
        password: 'xlzc1234',
        database: 'trade'
    });
    // need this to make decimal column represented as float rather than string
    // on JS side
    conn.config.decimalNumbers = true;
    conn.connect();
    return conn;
}

export async function get(e: RequestEvent) {
    const { url } = e;
    const conn = await createConn();
    // node.js native promisify

    let sql = `SELECT id, strategy,
    fund_account as fundAccount,
    fund_flow as fundFlow, 
    t
    from c_bond_fut_fund_flow`
    let constraints: string[] = [];
    if (url.searchParams.has('strategy')) {
        constraints.push(`strategy = '${url.searchParams.get('strategy')}'`)
    }

    if (url.searchParams.has('account')) {
        constraints.push(`fund_account = '${url.searchParams.get('account')}'`)
    }
    if (constraints.length > 0) {
        sql += ` WHERE ${constraints.join(' AND ')}`
    }

    const [rows, _] = await conn.execute(sql);
    conn.end();
    (rows as Cashflow[]).sort((a, b) => {
        return -(a.t.getTime() - b.t.getTime())
    })
    return {
        status: 200,
        body: rows,
    }
}


export async function post(e: RequestEvent) {
    const data: Cashflow = await e.request.json()
    const conn = await  createConn()
    const sql = `INSERT INTO c_bond_fut_fund_flow (strategy, fund_account, fund_flow, t) VALUES (?, ?, ?, ?)`
    const [result] = await conn.execute(sql, [data.strategy, data.fundAccount, data.fundFlow, moment(data.t).format('YYYY-MM-DD')]);
    conn.end()
    const header = result as ResultSetHeader
    return {
        status: StatusCodes.CREATED,
        body: {
            affected: header.affectedRows,
            insertedId: header.insertId,
        }
    }
}