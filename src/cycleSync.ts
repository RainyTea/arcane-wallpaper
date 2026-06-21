// shared time for candle lights to stay in sync
const MASTER_CYCLE_S = 60
export const MASTER_CYCLE_DELAY = `-${(Date.now() / 1000) % MASTER_CYCLE_S}s`
