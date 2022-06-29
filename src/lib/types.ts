export interface Price {
    bondCode: string
    symbol: string
    valueOn: Date,
    theoryValue: number
    tradeValue: number
    discount: number
    delta: number
    gamma: number
}

export interface Cashflow {
    id?: number
    strategy: string
    fundAccount: string
    fundFlow: number
    t: Date
}