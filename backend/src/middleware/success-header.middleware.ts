import type { RequestHandler } from 'express'
import onHeaders from 'on-headers'

export const successHeader: RequestHandler = (_request, response, next) => {
  onHeaders(response, function setSuccessHeader() {
    if (this.statusCode >= 200 && this.statusCode < 300) {
      this.setHeader('X-Test-Header', 'ayylmao')
    }
  })
  next()
}
