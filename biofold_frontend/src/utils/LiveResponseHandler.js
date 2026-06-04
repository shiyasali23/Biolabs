import { streamQuery } from '../lib/QueryApi.js'
import { BaseResponseHandler } from './BaseResponseHandler.js'

export class LiveResponseHandler extends BaseResponseHandler {
  run(query, inferenceLocally) {
    this.cancelled = false
    this.handler.begin(query)
    ;(async () => {
      try {
        for await (const event of streamQuery(query, inferenceLocally, () => this.cancelled)) {
          if (this.cancelled) return
          this.handler.ingest(event)
          if (event.event === 'done' || event.event === 'error') return
        }
      } catch (err) {
        if (this.cancelled) return
        this.handler.fail(err && err.message ? err.message : String(err))
      }
    })()
  }
}
