import { appendResponseHeader } from 'h3'

export async function fetchWithCookie(event, url, headers, uuid) {
  const resp = await $fetch.raw(url, { headers, query: { uuid } })

  const cookies = resp.headers.getSetCookie()

  for (const cookie of cookies) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  return resp._data
}
