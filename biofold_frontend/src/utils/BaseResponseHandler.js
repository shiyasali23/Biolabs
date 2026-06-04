import { ResponseHandler } from './ResponseHandler.js'

export class BaseResponseHandler {
  constructor() {
    this.handler = new ResponseHandler()
    this.cancelled = false
  }

  get state() {
    return this.handler.state
  }

  abort() {
    this.cancelled = true
    this.handler.dispose()
  }
}
