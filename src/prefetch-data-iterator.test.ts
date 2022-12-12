import { PrefetchIterator } from './prefetch-data-iterator';

test('Basic usage', async () => {
    const data = [
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
    ]
    type State = { skip: number }
    type Payload = number
    const prefetch = 2
    let fetchCount = 0

    const iterator = new PrefetchIterator<State, Payload>({
        prefetch,
        prefetchWaitDelay: 0,
        noPayloadsWaitDelay: 0,
        initialState: {
            skip: 0
        },
        async fetchNextPayload (state) {
            fetchCount++
            return {
                payload: data[state.skip],
                state: {
                    skip: state.skip + 1
                },
                isCompleted: state.skip + 1 === data.length
            }
        }
    })

    const generator = iterator.items()
    expect(fetchCount).toBe(0)
    const i0 = await generator.next()
    expect(i0.value).toBe(data[0])
    await delay(0)
    expect(fetchCount).toBe(3)
    const i1 = await generator.next()
    expect(i1.value).toBe(data[1])
    await delay(150)
    expect(fetchCount).toBe(4)
    const i2 = await generator.next()
    expect(i2.value).toBe(data[2])
    const i3 = await generator.next()
    expect(i3.value).toBe(data[3])
    const i4 = await generator.next()
    expect(i4.done).toBe(true)
})

function delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
