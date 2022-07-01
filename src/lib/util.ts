export function numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function asPercentage(x: number) {
    return `${(x * 100).toFixed(2)}%`
}