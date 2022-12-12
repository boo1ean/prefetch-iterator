type FetchNextPayloadFunction<TState, TPayload> = (state: TState) => Promise<{
    state: TState
    payload: TPayload
    isCompleted: boolean
}>

type PrefetchIteratorOptions<TState, TPayload> = {
    initialState: TState
    fetchNextPayload: FetchNextPayloadFunction<TState, TPayload>
    prefetch: number
    prefetchWaitDelay?: number
    noPayloadsWaitDelay?: number
}

export class PrefetchIterator<TState, TPayload> {
    #opts: PrefetchIteratorOptions<TState, TPayload>
    #state: TState
    #payloads: TPayload[] = []
    #prefetchWaitDelay = 150
    #noPayloadsWaitDelay = 150
    #isFetching = false
    #isStarted = false
    constructor (opts: PrefetchIteratorOptions<TState, TPayload>) {
        this.#opts = opts
        this.#state = opts.initialState
        if (opts.prefetchWaitDelay) {
            this.#prefetchWaitDelay = opts.prefetchWaitDelay
        }
        if (opts.noPayloadsWaitDelay) {
            this.#noPayloadsWaitDelay = opts.noPayloadsWaitDelay
        }
    }
    async *items () {
        if (this.#isStarted) {
            throw new Error('Fetching is already started. Can\'t use stream twice.')
        }
        this.#isStarted = true
        this.#isFetching = true
        this.#startFetching()
        do {
            if (this.#payloads.length) {
                yield this.#payloads.shift()!
            } else {
                await delay(this.#noPayloadsWaitDelay)
            }
        } while (this.#isFetching || this.#payloads.length > 0)
    }
    async #startFetching () {
        do {
            // If we max number of payloads - skip fetching next one
            if (this.#payloads.length === this.#opts.prefetch) {
                await delay(this.#prefetchWaitDelay)
                continue
            }
            const {
                payload,
                isCompleted,
                state: nextState
            } = await this.#opts.fetchNextPayload(this.#state)
            this.#state = nextState
            this.#isFetching = !isCompleted
            this.#payloads.push(payload)
        } while (this.#isFetching)
    }
}
function delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
