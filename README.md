## Installation

```
npm i prefetch-iterator
```

## Usage

```ts
import { PrefetchIterator } from 'prefetch-data-iterator'
import { MongoClient } from 'mongodb'

type State = {
    skip: number
    limit: number
}
type Payload = any[]

const mongo = new MongoClient('mognodb://localhost')
const iterator = new PrefetchIterator<State, Payload>({
    initialState: {
        skip: 0,
        limit: 100
    },
    fetchNextPayload (state) {
        const payload = await mognodb.db().collection('transactions')
            .find()
            .skip(state.skip)
            .limit(state.limit)
            .toArray()
        return {
            payload,
            state: {
                ...state,
                skip: state.skip + payload.length
            }
        }
    }
})

for async (const payload of iterator.items()) {
    await someHeavyProcessing(payload)
}
```
