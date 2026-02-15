export function updateOnlineMean(prevMean: number, prevN: number, x: number): number {
    return prevMean + (x - prevMean) / (prevN + 1);
}